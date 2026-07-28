import type { SupabaseClient } from "@supabase/supabase-js";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { locationLabelFromId } from "@/lib/admin/access";

export type AnalyticsBreakdown = {
  label: string;
  count: number;
  amount?: number;
};

export type SalonAnalytics = {
  since: string;
  until: string;
  /** Visit-day bookings (filtered by start_at). */
  bookingsTotal: number;
  newClientsTotal: number;
  completedTotal: number;
  noShowTotal: number;
  arrivedTotal: number;
  cancelledTotal: number;
  /** completed / (completed + no_show + arrived) among floor outcomes */
  showRate: number;
  /** no_show / (completed + no_show + arrived) */
  noShowRate: number;
  awaitingApproval: number;
  depositTotal: number;
  depositsPaidCount: number;
  depositsPendingCount: number;
  promoBookings: number;
  promoSavingsEstimate: number;
  byLocation: AnalyticsBreakdown[];
  byService: AnalyticsBreakdown[];
  byStylist: AnalyticsBreakdown[];
  byPromo: AnalyticsBreakdown[];
  byStatus: AnalyticsBreakdown[];
  rawRows: AnalyticsBookingRow[];
};

export type AnalyticsBookingRow = {
  id?: string;
  status?: string;
  location_id?: string | null;
  staff_id?: string | null;
  promotion_code?: string | null;
  deposit_amount?: number | null;
  deposit_paid?: boolean | null;
  add_ons?: unknown;
  services?: { name?: string } | { name?: string }[] | null;
  staff?: { name?: string } | { name?: string }[] | null;
  created_at?: string;
  client_name?: string | null;
  start_at?: string;
};

export type AnalyticsRange = {
  since: Date;
  until: Date;
};

export function parseAnalyticsRange(fromParam?: string, toParam?: string): AnalyticsRange {
  let until = toParam ? new Date(`${toParam}T23:59:59.999`) : new Date();
  if (Number.isNaN(until.getTime())) {
    until = new Date();
  }

  let since: Date;
  if (fromParam) {
    since = new Date(`${fromParam}T00:00:00`);
    if (Number.isNaN(since.getTime())) {
      since = new Date(until);
      since.setDate(since.getDate() - 30);
    }
  } else {
    since = new Date(until);
    since.setDate(since.getDate() - 30);
  }

  if (since > until) {
    const tmp = new Date(since);
    since = new Date(until);
    until = tmp;
  }

  return { since, until };
}

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

function relationName(
  value: { name?: string } | { name?: string }[] | null | undefined,
): string {
  if (!value) return "Unknown";
  if (Array.isArray(value)) return value[0]?.name ?? "Unknown";
  return value.name ?? "Unknown";
}

export async function loadSalonAnalytics(
  admin: SupabaseClient,
  range?: AnalyticsRange,
): Promise<SalonAnalytics> {
  const { since, until } = range ?? parseAnalyticsRange();
  const sinceIso = since.toISOString();
  const untilIso = until.toISOString();

  const [newClients, awaitingApproval, bookingRows, depositsPaid] = await Promise.all([
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso)
      .lte("created_at", untilIso),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "awaiting_approval"),
    admin
      .from("bookings")
      .select(
        "id, status, location_id, staff_id, promotion_code, deposit_amount, deposit_paid, add_ons, services(name), staff(name), created_at, client_name, start_at",
      )
      .gte("start_at", sinceIso)
      .lte("start_at", untilIso)
      .order("start_at", { ascending: false }),
    admin
      .from("bookings")
      .select("deposit_amount, deposit_paid, promotion_code, add_ons")
      .gte("start_at", sinceIso)
      .lte("start_at", untilIso)
      .gt("deposit_amount", 0),
  ]);

  const rows = (bookingRows.data ?? []) as AnalyticsBookingRow[];
  const depositRows = depositsPaid.data ?? [];

  const completedTotal = rows.filter((r) => r.status === "completed").length;
  const noShowTotal = rows.filter((r) => r.status === "no_show").length;
  const arrivedTotal = rows.filter((r) => r.status === "arrived").length;
  const cancelledTotal = rows.filter(
    (r) => r.status === "cancelled" || r.status === "rejected",
  ).length;

  const floorOutcomes = completedTotal + noShowTotal + arrivedTotal;
  const showRate =
    floorOutcomes > 0 ? Math.round(((completedTotal + arrivedTotal) / floorOutcomes) * 100) : 0;
  const noShowRate = floorOutcomes > 0 ? Math.round((noShowTotal / floorOutcomes) * 100) : 0;

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

  const byLocation = countByKey(rows, (r) => locationLabelFromId(r.location_id ?? null) ?? "Unknown");
  const byService = countByKey(rows, (r) => relationName(r.services));
  const byStylist = countByKey(rows, (r) => {
    if (!r.staff_id) return "Unassigned";
    const name = relationName(r.staff);
    return name === "Unknown" ? "Unassigned" : name;
  });
  const byPromo = countByKey(
    promoRows,
    (r) => String(r.promotion_code).toUpperCase(),
    (r) => Number(r.deposit_amount ?? 0),
  );
  const byStatus = countByKey(rows, (r) =>
    String(r.status ?? "unknown").replaceAll("_", " "),
  );

  for (const loc of SALON_LOCATIONS) {
    if (!byLocation.some((b) => b.label === loc.area)) {
      byLocation.push({ label: loc.area, count: 0 });
    }
  }
  byLocation.sort((a, b) => b.count - a.count);

  return {
    since: sinceIso,
    until: untilIso,
    bookingsTotal: rows.length,
    newClientsTotal: newClients.count ?? 0,
    completedTotal,
    noShowTotal,
    arrivedTotal,
    cancelledTotal,
    showRate,
    noShowRate,
    awaitingApproval: awaitingApproval.count ?? 0,
    depositTotal,
    depositsPaidCount,
    depositsPendingCount,
    promoBookings: promoRows.length,
    promoSavingsEstimate,
    byLocation,
    byService,
    byStylist,
    byPromo,
    byStatus,
    rawRows: rows,
  };
}

export function analyticsToCsv(stats: SalonAnalytics) {
  const lines: string[] = [
    "Glam Room analytics export",
    `From,${stats.since}`,
    `To,${stats.until}`,
    "Range basis,visit day (start_at)",
    "",
    "Summary",
    `Bookings,${stats.bookingsTotal}`,
    `Completed,${stats.completedTotal}`,
    `Arrived,${stats.arrivedTotal}`,
    `No-shows,${stats.noShowTotal}`,
    `Show rate %,${stats.showRate}`,
    `No-show rate %,${stats.noShowRate}`,
    `Cancelled / rejected,${stats.cancelledTotal}`,
    `Deposits collected (GHS),${stats.depositTotal}`,
    `Promo bookings,${stats.promoBookings}`,
    "",
    "By location",
    "Location,Count",
    ...stats.byLocation.map((r) => `${csvEscape(r.label)},${r.count}`),
    "",
    "By stylist",
    "Stylist,Count",
    ...stats.byStylist.map((r) => `${csvEscape(r.label)},${r.count}`),
    "",
    "By service",
    "Service,Count",
    ...stats.byService.map((r) => `${csvEscape(r.label)},${r.count}`),
    "",
    "By status",
    "Status,Count",
    ...stats.byStatus.map((r) => `${csvEscape(r.label)},${r.count}`),
  ];

  const raw = stats.rawRows;
  if (raw.length > 0) {
    lines.push("", "Bookings", "Visit start,Created,Status,Location,Stylist,Service,Client");
    for (const row of raw) {
      lines.push(
        [
          csvEscape(String(row.start_at ?? "")),
          csvEscape(String(row.created_at ?? "")),
          csvEscape(String(row.status ?? "")),
          csvEscape(locationLabelFromId(row.location_id as string | null) ?? ""),
          csvEscape(row.staff_id ? relationName(row.staff) : "Unassigned"),
          csvEscape(relationName(row.services)),
          csvEscape(String(row.client_name ?? "")),
        ].join(","),
      );
    }
  }

  return lines.join("\n");
}

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
