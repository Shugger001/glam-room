import type { SupabaseClient } from "@supabase/supabase-js";
import {
  notifyClientBookingUpdate,
  notifySalonBookingRequest,
} from "@/lib/notifications/booking-notifications";
import { canAutoConfirmBookingStatus } from "@/lib/payments/paystack-match";

type FinalizeOptions = {
  /** Notify salon that a deposit was received (Paystack / desk). Default true. */
  notifySalonDeposit?: boolean;
  /** How the deposit was marked. */
  source?: "paystack" | "desk" | "manual";
};

/**
 * Mark deposit paid and auto-confirm the chair when the booking is still pending approval.
 * Idempotent: safe to call again after Paystack redirect + webhook.
 */
export async function finalizePaidBooking(
  admin: SupabaseClient,
  bookingId: string,
  options: FinalizeOptions = {},
): Promise<{
  ok: boolean;
  reason?: string;
  confirmed: boolean;
  alreadyPaid: boolean;
  status: string;
}> {
  const { data: booking, error } = await admin
    .from("bookings")
    .select("id, status, deposit_paid")
    .eq("id", bookingId)
    .maybeSingle();

  if (error) return { ok: false, reason: error.message, confirmed: false, alreadyPaid: false, status: "" };
  if (!booking) {
    return { ok: false, reason: "Booking not found.", confirmed: false, alreadyPaid: false, status: "" };
  }

  const alreadyPaid = Boolean(booking.deposit_paid);
  const canConfirm = canAutoConfirmBookingStatus(booking.status);
  const nextStatus = canConfirm ? "confirmed" : booking.status;

  const updatePayload: Record<string, unknown> = {
    deposit_paid: true,
    updated_at: new Date().toISOString(),
  };
  if (canConfirm) {
    updatePayload.status = "confirmed";
  }

  const { error: updateError } = await admin.from("bookings").update(updatePayload).eq("id", bookingId);
  if (updateError) {
    return {
      ok: false,
      reason: updateError.message,
      confirmed: false,
      alreadyPaid,
      status: booking.status,
    };
  }

  const notifySalon = options.notifySalonDeposit !== false && !alreadyPaid;
  const notifyClientConfirmed = canConfirm;
  const notifyClientDepositOnly = !alreadyPaid && !canConfirm;

  await Promise.allSettled([
    notifySalon
      ? notifySalonBookingRequest(admin, bookingId, "deposit_paid")
      : Promise.resolve(),
    notifyClientConfirmed
      ? notifyClientBookingUpdate(admin, bookingId, "confirmed")
      : notifyClientDepositOnly
        ? notifyClientBookingUpdate(admin, bookingId, "deposit_paid")
        : Promise.resolve(),
  ]);

  void options.source;

  return {
    ok: true,
    confirmed: canConfirm,
    alreadyPaid,
    status: nextStatus,
  };
}
