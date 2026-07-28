import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { loadSalonAnalytics, parseAnalyticsRange } from "../src/lib/admin/analytics-data";
import { loadShopCapacityToday } from "../src/lib/admin/load-shop-capacity";
import { enrichBookingsWithCrm } from "../src/lib/admin/enrich-bookings-crm";
import type { AdminBookingRow } from "../src/components/admin/bookings-table";

async function main() {
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split("\n")
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        let v = l.slice(i + 1).trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        return [l.slice(0, i), v];
      }),
  );

  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const range = parseAnalyticsRange("2026-06-01", "2026-07-28");
  const [stats, capacity, bookings] = await Promise.all([
    loadSalonAnalytics(admin, range),
    loadShopCapacityToday(admin, null),
    admin
      .from("bookings")
      .select(
        "id, start_at, status, location_id, staff_id, client_name, client_phone, client_notes, admin_notes, deposit_paid, deposit_amount, paystack_reference, promotion_code, profiles(full_name,phone,crm_tags,admin_notes), services(name), staff(name)",
      )
      .order("start_at", { ascending: false })
      .limit(20),
  ]);

  const enriched = await enrichBookingsWithCrm(
    admin,
    (bookings.data ?? []) as unknown as AdminBookingRow[],
  );

  console.log(
    JSON.stringify(
      {
        analytics: {
          bookingsTotal: stats.bookingsTotal,
          completedTotal: stats.completedTotal,
          noShowTotal: stats.noShowTotal,
          showRate: stats.showRate,
          noShowRate: stats.noShowRate,
          byStylist: stats.byStylist,
          byStatus: stats.byStatus,
          byLocation: stats.byLocation,
        },
        capacity,
        bookingsFetched: bookings.data?.length ?? 0,
        bookingError: bookings.error?.message ?? null,
        enrichedSample: enriched.slice(0, 5).map((b) => ({
          id: b.id,
          status: b.status,
          client: b.client_name,
          deposit_paid: b.deposit_paid,
          deposit_amount: b.deposit_amount,
          crm_tags: b.profiles?.crm_tags ?? null,
          hasPhone: Boolean(b.client_phone ?? b.profiles?.phone),
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
