import type { SupabaseClient } from "@supabase/supabase-js";

/** Floaters (`home_location_id` null) serve every shop; others only their home shop. */
export function staffServesLocation(
  homeLocationId: string | null | undefined,
  locationId: string,
) {
  return !homeLocationId || homeLocationId === locationId;
}

export function filterStaffForLocation<T extends { homeLocationId?: string | null }>(
  staff: T[],
  locationId: string | null | undefined,
): T[] {
  if (!locationId) return staff;
  return staff.filter((member) => staffServesLocation(member.homeLocationId, locationId));
}

/**
 * Ensure a stylist is active, bookable (not front desk), and assigned to the shop.
 */
export async function assertBookableStaff(
  supabase: SupabaseClient,
  staffId: string,
  locationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from("staff")
    .select("id, active, is_front_desk, home_location_id")
    .eq("id", staffId)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data || data.active === false || data.is_front_desk === true) {
    return { ok: false, error: "Stylist assignment is invalid." };
  }
  if (!staffServesLocation(data.home_location_id as string | null, locationId)) {
    return { ok: false, error: "That stylist does not work at this shop. Pick another expert." };
  }
  return { ok: true };
}
