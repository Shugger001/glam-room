import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchPaystackTransaction } from "@/lib/payments/paystack-transaction";
import {
  notifyClientBookingUpdate,
  notifySalonBookingRequest,
} from "@/lib/notifications/booking-notifications";

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
): Promise<{ ok: boolean; reason?: string; bookingId?: string; alreadyPaid?: boolean }> {
  const { data: booking, error } = await admin
    .from("bookings")
    .select("id, deposit_amount, deposit_paid, add_ons")
    .eq("paystack_reference", input.reference)
    .maybeSingle();

  if (error) return { ok: false, reason: error.message };
  if (!booking) return { ok: false, reason: "Booking not found for reference." };

  const depositMajor = Number(booking.deposit_amount ?? 0);
  const expectedMinor = Math.round(depositMajor * 100);
  const amountMatches =
    input.amountMinor == null || expectedMinor <= 0 || input.amountMinor === expectedMinor;
  const currencyMatches =
    !input.currency ||
    input.currency.toUpperCase() ===
      (process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY?.trim().toUpperCase() || "GHS");

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

  if (booking.deposit_paid) {
    await admin
      .from("bookings")
      .update({ add_ons: nextAddOns, updated_at: new Date().toISOString() })
      .eq("id", booking.id);
    return { ok: true, bookingId: booking.id, alreadyPaid: true };
  }

  if (!amountMatches || !currencyMatches) {
    await admin
      .from("bookings")
      .update({ add_ons: nextAddOns, updated_at: new Date().toISOString() })
      .eq("id", booking.id);
    return { ok: false, reason: "Payment amount mismatch.", bookingId: booking.id };
  }

  if (!input.paid) {
    await admin
      .from("bookings")
      .update({ add_ons: nextAddOns, updated_at: new Date().toISOString() })
      .eq("id", booking.id);
    return { ok: false, reason: "Payment not completed.", bookingId: booking.id };
  }

  await admin
    .from("bookings")
    .update({
      deposit_paid: true,
      add_ons: nextAddOns,
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking.id);

  await Promise.allSettled([
    notifySalonBookingRequest(admin, booking.id, "deposit_paid"),
    notifyClientBookingUpdate(admin, booking.id, "deposit_paid"),
  ]);

  return { ok: true, bookingId: booking.id };
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
    error: result.reason,
  };
}
