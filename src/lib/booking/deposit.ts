/** Share of service price collected as deposit (30%). */
export const DEPOSIT_PERCENT = 0.3;

/** Minimum deposit in GHS (Paystack requires at least ₵1). */
export const MIN_DEPOSIT_GHS = 1;

export function computeDepositAmount(servicePrice: number): number {
  if (DEPOSIT_PERCENT <= 0 || servicePrice <= 0) return 0;
  const raw = Math.round(servicePrice * DEPOSIT_PERCENT);
  return Math.max(raw, MIN_DEPOSIT_GHS);
}

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function depositRequiredForService(servicePrice: number): boolean {
  return isPaystackConfigured() && computeDepositAmount(servicePrice) > 0;
}
