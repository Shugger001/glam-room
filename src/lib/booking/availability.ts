import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizePhoneDigits, parseClientNotesField, phoneVariants } from "@/lib/booking/phone";

const ACTIVE_STATUSES = ["pending", "awaiting_approval", "confirmed"] as const;

export async function isSlotAvailable(
  supabase: SupabaseClient,
  startAt: string,
  locationId?: string | null,
) {
  let query = supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("start_at", startAt)
    .in("status", [...ACTIVE_STATUSES]);

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

  const { count, error } = await query;
  if (error) return { available: false, error: error.message };
  return { available: (count ?? 0) < 3, error: null };
}

/** Block the same client from booking an identical date/time twice. */
export async function hasClientDuplicateBooking(
  supabase: SupabaseClient,
  startAt: string,
  clientPhone: string,
) {
  const variants = new Set(phoneVariants(clientPhone).map(normalizePhoneDigits));

  const { data, error } = await supabase
    .from("bookings")
    .select("id, client_phone, client_notes")
    .eq("start_at", startAt)
    .in("status", [...ACTIVE_STATUSES]);

  if (error) return { duplicate: false, error: error.message };

  const duplicate = (data ?? []).some((booking) => {
    const storedPhone =
      booking.client_phone ?? parseClientNotesField(booking.client_notes, "Phone") ?? "";
    return phoneVariants(storedPhone).some((variant) =>
      variants.has(normalizePhoneDigits(variant)),
    );
  });

  return { duplicate, error: null };
}
