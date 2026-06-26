/** Flat booking deposit in GHS (collected via Paystack). */
export const BOOKING_DEPOSIT_GHS = 50;

export function computeDepositAmount(_servicePrice?: number): number {
  return BOOKING_DEPOSIT_GHS;
}

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function depositRequiredForService(_servicePrice?: number): boolean {
  return isPaystackConfigured() && BOOKING_DEPOSIT_GHS > 0;
}
