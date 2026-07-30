import { test, expect } from "@playwright/test";
import { adminCredentials } from "./helpers";

test.describe("Admin ops smoke", () => {
  test("auth page is reachable for staff", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole("heading", { name: /Staff sign in/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("staff can sign in and open attendance clock", async ({ page }) => {
    const creds = adminCredentials();
    test.skip(!creds, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin mutation smoke.");

    await page.goto("/auth?next=/admin/attendance");
    await page.getByLabel("Email").fill(creds!.email);
    await page.getByLabel("Password").fill(creds!.password);
    await page.getByRole("button", { name: /^Sign in$/i }).click();

    await expect(page).toHaveURL(/\/admin(\/attendance)?/, { timeout: 20_000 });
    await page.goto("/admin/attendance");
    await expect(page.getByRole("heading", { name: /Staff attendance/i })).toBeVisible();
    await expect(page.getByText(/Front desk clock-in|on floor|Attendance/i).first()).toBeVisible();

    // Prefer a clock-in mutation when someone is off floor; otherwise assert clock-out UI exists for on-floor staff.
    const clockIn = page.getByRole("button", { name: /^In$/i }).first();
    const clockOut = page.getByRole("button", { name: /Clock out/i }).first();

    if (await clockIn.isVisible().catch(() => false)) {
      page.once("dialog", (dialog) => dialog.dismiss().catch(() => undefined));
      await clockIn.click();
      await expect(
        page.getByText(/clocked in|already clocked|on floor/i).first(),
      ).toBeVisible({ timeout: 15_000 });
    } else {
      await expect(clockOut.or(page.getByText(/Nobody clocked in|No active team/i))).toBeVisible();
    }

    // Timesheet / export affordances from attendance improvements
    await expect(page.getByRole("link", { name: /Export CSV|Download CSV/i }).first()).toBeVisible();
  });

  test("wrong password stays on auth", async ({ page }) => {
    const creds = adminCredentials();
    test.skip(!creds, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run auth failure smoke.");

    await page.goto("/auth");
    await page.getByLabel("Email").fill(creds!.email);
    await page.getByLabel("Password").fill("definitely-wrong-password-e2e");
    await page.getByRole("button", { name: /^Sign in$/i }).click();

    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByRole("heading", { name: /Staff sign in/i })).toBeVisible();
  });
});
