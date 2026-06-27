import type { SupabaseClient } from "@supabase/supabase-js";
import {
  nameSuffixMatches,
  normalizePhoneDigits,
  parseClientNotesField,
  phoneVariants,
} from "@/lib/booking/phone";

export const LOOKUP_ACTIVE_STATUSES = ["pending", "awaiting_approval", "confirmed"] as const;
export const MANAGEABLE_STATUSES = new Set<string>([...LOOKUP_ACTIVE_STATUSES]);

export type LookupBookingRow = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  client_name: string | null;
  client_phone: string | null;
  location_id: string | null;
  client_notes: string | null;
  services: { name?: string; duration_minutes?: number } | { name?: string; duration_minutes?: number }[] | null;
};

export async function findClientBookings(
  supabase: SupabaseClient,
  phone: string,
  nameSuffix: string,
): Promise<{ bookings: LookupBookingRow[]; error: string | null }> {
  const variants = new Set(phoneVariants(phone).map(normalizePhoneDigits));

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, start_at, end_at, status, client_name, client_phone, location_id, client_notes, services(name, duration_minutes)",
    )
    .in("status", [...LOOKUP_ACTIVE_STATUSES])
    .order("start_at", { ascending: false })
    .limit(50);

  if (error) return { bookings: [], error: error.message };

  const bookings = (data ?? []).filter((row) => {
    const storedPhone =
      row.client_phone ?? parseClientNotesField(row.client_notes, "Phone") ?? "";
    const storedName =
      row.client_name ?? parseClientNotesField(row.client_notes, "Name") ?? "";
    const phoneHit = phoneVariants(storedPhone).some((v) => variants.has(normalizePhoneDigits(v)));
    return phoneHit && nameSuffixMatches(storedName, nameSuffix);
  }) as LookupBookingRow[];

  return { bookings, error: null };
}

export async function verifyClientBooking(
  supabase: SupabaseClient,
  bookingId: string,
  phone: string,
  nameSuffix: string,
) {
  const { bookings, error } = await findClientBookings(supabase, phone, nameSuffix);
  if (error) return { booking: null, error };
  const booking = bookings.find((b) => b.id === bookingId) ?? null;
  if (!booking) {
    return { booking: null, error: "Booking not found for this phone and name." };
  }
  return { booking, error: null };
}
