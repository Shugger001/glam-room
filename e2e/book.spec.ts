import { test, expect } from "@playwright/test";
import { fillGuestBookingBasics } from "./helpers";

test.describe("Public booking smoke", () => {
  test("book page loads and shows validation on empty submit", async ({ page }) => {
    await page.goto("/book");
    await expect(page.getByRole("heading", { name: /book|appointment|glam/i }).first()).toBeVisible();

    await page.getByRole("button", { name: /Book appointment|Pay deposit|Secure/i }).click();

    await expect(page.getByText(/required|select|enter/i).first()).toBeVisible();
  });

  test("guest can complete booking form through deposit or submit", async ({ page }) => {
    await page.goto("/book");

    await fillGuestBookingBasics(page);

    // Mock Paystack initialize so we never hit real checkout
    await page.route("**/api/paystack/booking/initialize", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authorization_url: "https://checkout.paystack.com/e2e-smoke-mock",
          reference: "e2e_smoke_ref",
          deposit_amount: 50,
          booking_id: "00000000-0000-4000-8000-000000000099",
        }),
      });
    });

    // Also allow guest booking path when Paystack is not configured
    let guestPosted = false;
    await page.route("**/api/bookings/guest", async (route) => {
      guestPosted = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, booking_id: "00000000-0000-4000-8000-000000000098" }),
      });
    });

    const submit = page.getByRole("button", { name: /Book appointment|Pay deposit|Secure with deposit/i });
    await expect(submit).toBeEnabled();

    const [nav] = await Promise.all([
      page.waitForURL(/paystack|book|track|complete/i, { timeout: 20_000 }).catch(() => null),
      submit.click(),
    ]);

    const onPaystackMock = page.url().includes("checkout.paystack.com/e2e-smoke-mock");
    const successCopy = page.getByText(/received|confirmed|booked|thank|find my booking/i);
    const sawSuccess = await successCopy.first().isVisible().catch(() => false);

    expect(onPaystackMock || guestPosted || sawSuccess || nav).toBeTruthy();
  });
});
