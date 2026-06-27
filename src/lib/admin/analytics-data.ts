import type { SupabaseClient } from "@supabase/supabase-js";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { locationLabelFromId } from "@/lib/admin/access";

export type AnalyticsBreakdown = {
  label: string;
  count: number;
  amount?: number;
};

export type SalonAnalytics = {
  bookings30d: number;
  newClients30d: number;
  completed30d: number;
  awaitingApproval: number;
  depositTotal: number;
  depositsPaidCount: number;
  depositsPendingCount: number;
  promoBookings: number;
  promoSavingsEstimate: number;
  byLocation: AnalyticsBreakdown[];
  byService: AnalyticsBreakdown[];
  byPromo: AnalyticsBreakdown[];
  byStatus: AnalyticsBreakdown[];
};

function countByKey<T>(
  rows: T[],
  keyFn: (row: T) => string,
  amountFn?: (row: T) => number,
): AnalyticsBreakdown[] {
  const map = new Map<string, { count: number; amount: number }>();
  for (const row of rows) {
    const key = keyFn(row) || "Unknown";
    const prev = map.get(key) ?? { count: 0, amount: 0 };
    map.set(key, {
      count: prev.count + 1,
      amount: prev.amount + (amountFn?.(row) ?? 0),
    });
  }
  return [...map.entries()]
    .map(([label, v]) => ({ label, count: v.count, amount: v.amount }))
    .sort((a, b) => b.count - a.count);
}

export async function loadSalonAnalytics(admin: SupabaseClient): Promise<SalonAnalytics> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString();

  const [
    recentBookings,
    completedBookings,
    newClients,
    awaitingApproval,
    bookingRows,
    depositsPaid,
  ] = await Promise.all([
    admin.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", since),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", since),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "awaiting_approval"),
    admin
      .from("bookings")
      .select(
        "id, status, location_id, promotion_code, deposit_amount, deposit_paid, add_ons, services(name)",
      )
      .gte("created_at", since),
    admin
      .from("bookings")
      .select("deposit_amount, deposit_paid, promotion_code, add_ons")
      .gte("created_at", since)
      .gt("deposit_amount", 0),
  ]);

  const rows = bookingRows.data ?? [];
  const depositRows = depositsPaid.data ?? [];

  const depositTotal = depositRows
    .filter((r) => r.deposit_paid)
    .reduce((sum, r) => sum + Number(r.deposit_amount ?? 0), 0);

  const depositsPaidCount = depositRows.filter((r) => r.deposit_paid).length;
  const depositsPendingCount = depositRows.filter((r) => !r.deposit_paid).length;

  const promoRows = rows.filter((r) => r.promotion_code);
  const promoSavingsEstimate = promoRows.reduce((sum, row) => {
    const addOns = row.add_ons as { promo?: { savings?: number } } | null;
    return sum + Number(addOns?.promo?.savings ?? 0);
  }, 0);

  const byLocation = countByKey(rows, (r) => locationLabelFromId(r.location_id) ?? "Unknown");
  const byService = countByKey(rows, (r) => {
    const svc = r.services as { name?: string } | { name?: string }[] | null;
    if (Array.isArray(svc)) return svc[0]?.name ?? "Unknown";
    return svc?.name ?? "Unknown";
  });
  const byPromo = countByKey(
    promoRows,
    (r) => String(r.promotion_code).toUpperCase(),
    (r) => Number(r.deposit_amount ?? 0),
  );
  const byStatus = countByKey(rows, (r) =>
    String(r.status ?? "unknown").replaceAll("_", " "),
  );

  // Ensure all locations appear even at zero
  for (const loc of SALON_LOCATIONS) {
    if (!byLocation.some((b) => b.label === loc.area)) {
      byLocation.push({ label: loc.area, count: 0 });
    }
  }
  byLocation.sort((a, b) => b.count - a.count);

  return {
    bookings30d: recentBookings.count ?? 0,
    newClients30d: newClients.count ?? 0,
    completed30d: completedBookings.count ?? 0,
    awaitingApproval: awaitingApproval.count ?? 0,
    depositTotal,
    depositsPaidCount,
    depositsPendingCount,
    promoBookings: promoRows.length,
    promoSavingsEstimate,
    byLocation,
    byService,
    byPromo,
    byStatus,
  };
}
