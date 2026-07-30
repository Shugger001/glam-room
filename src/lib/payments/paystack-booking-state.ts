import type { SupabaseClient } from "@supabase/supabase-js";
import { finalizePaidBooking } from "@/lib/booking/finalize-paid-booking";
import {
  paystackAmountMatches,
  paystackCurrencyMatches,
} from "@/lib/payments/paystack-match";
import { fetchPaystackTransaction } from "@/lib/payments/paystack-transaction";

export type BookingPaymentEvent =
  | "redirect_verify"
  | "webhook_charge_success"
  | "webhook_charge_failed";

type ApplyBookingPaymentInput = {
  reference: string;
  amountMinor: number | null;
  currency: string | null;
  paid: boolean;
  eventType: BookingPaymentEvent;
};

function appendPaymentLog(
  existing: Record<string, unknown> | null,
  entry: Record<string, unknown>,
): Record<string, unknown> {
  const prev = existing && typeof existing === "object" ? existing : {};
  const arr = Array.isArray(prev.payment_events) ? prev.payment_events : [];
  return { ...prev, payment_events: [...arr, entry].slice(-20) };
}

export async function applyPaystackBookingVerification(
  admin: SupabaseClient,
  input: ApplyBookingPaymentInput,
): Promise<{ ok: boolean; reason?: string; bookingId?: string; alreadyPaid?: boolean; confirmed?: boolean }> {
  const { data: booking, error } = await admin
    .from("bookings")
    .select("id, deposit_amount, deposit_paid, add_ons, status")
    .eq("paystack_reference", input.reference)
    .maybeSingle();

  if (error) return { ok: false, reason: error.message };
  if (!booking) return { ok: false, reason: "Booking not found for reference." };

  const depositMajor = Number(booking.deposit_amount ?? 0);
  const amountMatches = paystackAmountMatches(depositMajor, input.amountMinor);
  const currencyMatches = paystackCurrencyMatches(input.currency);

  const auditEntry = {
    at: new Date().toISOString(),
    source: input.eventType,
    paid: input.paid,
    amount_minor: input.amountMinor,
    currency: input.currency,
    amount_matches: amountMatches,
    currency_matches: currencyMatches,
  };

  const nextAddOns = appendPaymentLog(
    (booking.add_ons as Record<string, unknown> | null) ?? null,
    auditEntry,
  );

  await admin
    .from("bookings")
    .update({ add_ons: nextAddOns, updated_at: new Date().toISOString() })
    .eq("id", booking.id);

  if (booking.deposit_paid) {
    const finalized = await finalizePaidBooking(admin, booking.id, {
      notifySalonDeposit: false,
      source: "paystack",
    });
    return {
      ok: finalized.ok,
      reason: finalized.reason,
      bookingId: booking.id,
      alreadyPaid: true,
      confirmed: finalized.confirmed,
    };
  }

  if (!amountMatches || !currencyMatches) {
    return { ok: false, reason: "Payment amount mismatch.", bookingId: booking.id };
  }

  if (!input.paid) {
    return { ok: false, reason: "Payment not completed.", bookingId: booking.id };
  }

  const finalized = await finalizePaidBooking(admin, booking.id, {
    notifySalonDeposit: true,
    source: "paystack",
  });

  return {
    ok: finalized.ok,
    reason: finalized.reason,
    bookingId: booking.id,
    alreadyPaid: finalized.alreadyPaid,
    confirmed: finalized.confirmed,
  };
}

export async function verifyAndApplyBookingPayment(reference: string) {
  const verified = await fetchPaystackTransaction(reference);
  if (!verified.ok || !verified.transaction) {
    return { ok: false as const, error: verified.error ?? "Verification failed." };
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const result = await applyPaystackBookingVerification(admin, {
    reference,
    amountMinor: verified.transaction.amount,
    currency: verified.transaction.currency,
    paid: verified.paid,
    eventType: "redirect_verify",
  });

  return {
    ok: result.ok,
    bookingId: result.bookingId,
    alreadyPaid: result.alreadyPaid,
    confirmed: result.confirmed,
    error: result.reason,
  };
}
