import type { SupabaseClient } from "@supabase/supabase-js";
import { getShopDailyBookingStatus, MAX_BOOKINGS_PER_SHOP_PER_DAY } from "@/lib/booking/availability";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import type { ShopCapacityRow } from "@/components/admin/shop-capacity-strip";

export async function loadShopCapacityToday(
  admin: SupabaseClient,
  locationScope: string | null,
): Promise<ShopCapacityRow[]> {
  const today = new Date().toISOString().slice(0, 10);
  const shops = locationScope
    ? SALON_LOCATIONS.filter((l) => l.id === locationScope)
    : SALON_LOCATIONS;

  return Promise.all(
    shops.map(async (loc) => {
      const status = await getShopDailyBookingStatus(admin, loc.id, today);
      return {
        id: loc.id,
        area: loc.area,
        count: status.count,
        max: status.max ?? MAX_BOOKINGS_PER_SHOP_PER_DAY,
        fullyBooked: status.fullyBooked,
      };
    }),
  );
}
