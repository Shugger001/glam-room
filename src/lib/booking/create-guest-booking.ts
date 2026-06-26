import type { SupabaseClient } from "@supabase/supabase-js";
import { isSlotAvailable } from "@/lib/booking/availability";
import { computeDepositAmount, DEPOSIT_PERCENT } from "@/lib/booking/deposit";
import type { GuestBookingValues } from "@/lib/validation/booking";

export type GuestBookingInsertInput = {
  values: GuestBookingValues;
  staffId: string;
  service: { id: string; durationMinutes: number; price: number };
  locationLabel: string;
  paystackReference?: string | null;
  depositPaid?: boolean;
};

function buildDatetime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export async function insertGuestBooking(
  supabase: SupabaseClient,
  input: GuestBookingInsertInput,
) {
  const { values, staffId, service, locationLabel } = input;
  const startAt = buildDatetime(values.bookingDate, values.bookingTime);
  const endAt = new Date(
    new Date(startAt).getTime() + service.durationMinutes * 60_000,
  ).toISOString();

  const slotCheck = await isSlotAvailable(supabase, startAt, values.locationId);
  if (!slotCheck.available) {
    return { ok: false as const, error: slotCheck.error ?? "That time slot is full." };
  }

  const depositAmount = computeDepositAmount(service.price);

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: null,
      service_id: service.id,
      staff_id: staffId,
      start_at: startAt,
      end_at: endAt,
      status: "awaiting_approval",
      location_type: "studio",
      deposit_amount: depositAmount,
      deposit_paid: input.depositPaid ?? false,
      paystack_reference: input.paystackReference ?? null,
      client_name: values.clientName.trim(),
      client_phone: values.clientPhone.trim(),
      location_id: values.locationId,
      client_notes: [
        `Location: ${locationLabel}`,
        values.clientNotes?.trim(),
        `Name: ${values.clientName.trim()}`,
        values.clientEmail ? `Email: ${values.clientEmail}` : null,
        `Phone: ${values.clientPhone.trim()}`,
      ]
        .filter(Boolean)
        .join("\n"),
      add_ons: { deposit_percent: DEPOSIT_PERCENT },
    })
    .select("id, deposit_amount")
    .single();

  if (error || !data) {
    return { ok: false as const, error: error?.message ?? "Could not save booking." };
  }

  return {
    ok: true as const,
    bookingId: data.id as string,
    depositAmount: Number(data.deposit_amount ?? depositAmount),
    startAt,
  };
}
