import { test, expect } from "@playwright/test";

test.describe("Marketing smoke", () => {
  test("home page renders brand and book CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Book|Appointment/i }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText(/Glam Room/i);
  });
});
