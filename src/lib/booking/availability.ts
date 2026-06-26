import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizePhoneDigits, parseClientNotesField, phoneVariants } from "@/lib/booking/phone";

/** Max concurrent bookings per shop time slot. */
export const MAX_BOOKINGS_PER_SLOT = 3;

/** Max bookings per shop location per calendar day. */
export const MAX_BOOKINGS_PER_SHOP_PER_DAY = 12;

const ACTIVE_STATUSES = ["pending", "awaiting_approval", "confirmed"] as const;

function bookingDayRange(bookingDate: string) {
  return {
    start: new Date(`${bookingDate}T00:00:00`).toISOString(),
    end: new Date(`${bookingDate}T23:59:59.999`).toISOString(),
  };
}

async function countActiveBookings(
  supabase: SupabaseClient,
  filters: {
    locationId: string;
    startAt?: string;
    bookingDate?: string;
  },
) {
  let query = supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("location_id", filters.locationId)
    .in("status", [...ACTIVE_STATUSES]);

  if (filters.startAt) {
    query = query.eq("start_at", filters.startAt);
  }

  if (filters.bookingDate) {
    const { start, end } = bookingDayRange(filters.bookingDate);
    query = query.gte("start_at", start).lte("start_at", end);
  }

  return query;
}

export async function isSlotAvailable(
  supabase: SupabaseClient,
  startAt: string,
  locationId?: string | null,
) {
  if (!locationId) {
    return { available: false, error: "Select a location to book." };
  }

  const { count, error } = await countActiveBookings(supabase, { locationId, startAt });
  if (error) return { available: false, error: error.message };

  if ((count ?? 0) >= MAX_BOOKINGS_PER_SLOT) {
    return {
      available: false,
      error: `This time slot is full (${MAX_BOOKINGS_PER_SLOT} bookings maximum). Please choose another time.`,
    };
  }

  return { available: true, error: null };
}

export async function isShopDailyCapacityAvailable(
  supabase: SupabaseClient,
  locationId: string,
  bookingDate: string,
) {
  const { count, error } = await countActiveBookings(supabase, { locationId, bookingDate });
  if (error) return { available: false, error: error.message };

  if ((count ?? 0) >= MAX_BOOKINGS_PER_SHOP_PER_DAY) {
    return {
      available: false,
      error: `This shop is fully booked for that day (${MAX_BOOKINGS_PER_SHOP_PER_DAY} appointments maximum). Please pick another date or location.`,
    };
  }

  return { available: true, error: null };
}

/** Enforce per-slot (3) and per-shop daily (12) capacity before creating a booking. */
export async function validateBookingCapacity(
  supabase: SupabaseClient,
  options: { startAt: string; locationId: string; bookingDate: string },
) {
  const dailyCheck = await isShopDailyCapacityAvailable(
    supabase,
    options.locationId,
    options.bookingDate,
  );
  if (!dailyCheck.available) {
    return dailyCheck;
  }

  return isSlotAvailable(supabase, options.startAt, options.locationId);
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
