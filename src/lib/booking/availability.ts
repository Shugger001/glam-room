import type { SupabaseClient } from "@supabase/supabase-js";

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
