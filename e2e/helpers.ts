import { expect, type Page } from "@playwright/test";

/** Pick a future weekday date (YYYY-MM-DD) at least 1 day ahead. */
export function bookingDatePlusDays(days = 2) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function fillGuestBookingBasics(page: Page, opts?: { name?: string; phone?: string }) {
  await page.getByLabel("Full name").fill(opts?.name ?? "E2E Smoke Client");
  await page.getByRole("textbox", { name: /WhatsApp/i }).fill(opts?.phone ?? "0244123456");

  await page.getByRole("group", { name: "Location" }).getByRole("button", { name: /Adenta/i }).click();

  const categoryGroup = page.getByRole("group", { name: "Category" });
  const category = categoryGroup.getByRole("button").first();
  await expect(category).toBeEnabled({ timeout: 15_000 });
  await category.click();
  await expect(category).toHaveAttribute("aria-pressed", "true");

  const style = page.getByLabel("Style");
  await expect(style).toBeEnabled({ timeout: 15_000 });
  const options = style.locator("option");
  const count = await options.count();
  expect(count).toBeGreaterThan(1);
  const value = await options.nth(1).getAttribute("value");
  expect(value).toBeTruthy();
  await style.selectOption(value!);

  const stylistSection = page.getByRole("group", { name: "Stylist" });
  if ((await stylistSection.count()) > 0) {
    const first = stylistSection.getByRole("button").first();
    if ((await first.count()) > 0) await first.click();
  }

  await page.getByLabel("Date").fill(bookingDatePlusDays(3));
  const time = page.getByLabel("Time");
  await expect(time).toBeEnabled();
  const timeOptions = time.locator("option:not([disabled])");
  const timeCount = await timeOptions.count();
  expect(timeCount).toBeGreaterThan(1);
  const timeValue = await timeOptions.nth(1).getAttribute("value");
  await time.selectOption(timeValue!);
}

export function adminCredentials() {
  const email = process.env.E2E_ADMIN_EMAIL?.trim();
  const password = process.env.E2E_ADMIN_PASSWORD?.trim();
  if (!email || !password) return null;
  return { email, password };
}
