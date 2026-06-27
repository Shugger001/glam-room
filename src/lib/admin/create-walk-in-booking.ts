import type { SupabaseClient } from "@supabase/supabase-js";
import { validateBookingCapacity } from "@/lib/booking/availability";
import { BOOKING_DEPOSIT_GHS, computeDepositAmount } from "@/lib/booking/deposit";
import type { AdminWalkInValues } from "@/lib/validation/admin-walk-in";

function buildDatetime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export async function createWalkInBooking(
  supabase: SupabaseClient,
  input: Omit<AdminWalkInValues, "staffId"> & {
    locationLabel: string;
    service: { id: string; durationMinutes: number; price: number };
    staffId: string | null;
    createdByUserId: string;
  },
) {
  const startAt = buildDatetime(input.bookingDate, input.bookingTime);
  const endAt = new Date(
    new Date(startAt).getTime() + input.service.durationMinutes * 60_000,
  ).toISOString();

  const capacityCheck = await validateBookingCapacity(supabase, {
    startAt,
    locationId: input.locationId,
    bookingDate: input.bookingDate,
  });
  if (!capacityCheck.available) {
    return { ok: false as const, error: capacityCheck.error ?? "That time slot is full." };
  }

  const waiveDeposit = input.waiveDeposit === "true";
  const depositAmount = waiveDeposit ? 0 : computeDepositAmount(input.service.price);

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: null,
      service_id: input.service.id,
      staff_id: input.staffId,
      start_at: startAt,
      end_at: endAt,
      status: input.status,
      location_type: "studio",
      deposit_amount: depositAmount,
      deposit_paid: waiveDeposit || depositAmount === 0,
      client_name: input.clientName.trim(),
      client_phone: input.clientPhone.trim(),
      location_id: input.locationId,
      client_notes: [
        `Location: ${input.locationLabel}`,
        input.clientNotes?.trim(),
        "Walk-in booking (admin)",
      ]
        .filter(Boolean)
        .join("\n"),
      admin_notes: [
        input.adminNotes?.trim(),
        `Created by admin ${input.createdByUserId.slice(0, 8)}`,
      ]
        .filter(Boolean)
        .join(" · "),
      add_ons: waiveDeposit ? { deposit_waived: true, deposit_flat_ghs: BOOKING_DEPOSIT_GHS } : { deposit_flat_ghs: BOOKING_DEPOSIT_GHS },
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false as const, error: error?.message ?? "Could not create booking." };
  }

  return { ok: true as const, bookingId: data.id as string };
}
