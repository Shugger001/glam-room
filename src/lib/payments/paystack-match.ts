/**
 * Pure Paystack deposit match helpers — unit-tested; used by booking verification.
 */

export function expectedDepositMinor(depositMajor: number): number {
  return Math.round(Number(depositMajor ?? 0) * 100);
}

/**
 * Amount matches when Paystack omitted amount, deposit is free/zero, or minor units equal deposit.
 */
export function paystackAmountMatches(
  depositMajor: number,
  amountMinor: number | null,
): boolean {
  const expectedMinor = expectedDepositMinor(depositMajor);
  return amountMinor == null || expectedMinor <= 0 || amountMinor === expectedMinor;
}

export function paystackExpectedCurrency(): string {
  return process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY?.trim().toUpperCase() || "GHS";
}

/** Currency matches when Paystack omitted currency or it equals configured currency. */
export function paystackCurrencyMatches(currency: string | null | undefined): boolean {
  if (!currency) return true;
  return currency.toUpperCase() === paystackExpectedCurrency();
}

/** Statuses that auto-confirm when a deposit clears. */
export const CONFIRMABLE_BOOKING_STATUSES = new Set(["pending", "awaiting_approval"]);

export function canAutoConfirmBookingStatus(status: string): boolean {
  return CONFIRMABLE_BOOKING_STATUSES.has(status);
}
