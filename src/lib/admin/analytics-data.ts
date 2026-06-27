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
  bookingsTotal: number;
  newClientsTotal: number;
  completedTotal: number;
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
  rawRows: AnalyticsBookingRow[];
};

export type AnalyticsBookingRow = {
  id?: string;
  status?: string;
  location_id?: string | null;
  promotion_code?: string | null;
  deposit_amount?: number | null;
  deposit_paid?: boolean | null;
  add_ons?: unknown;
  services?: { name?: string } | { name?: string }[] | null;
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

export async function loadSalonAnalytics(
  admin: SupabaseClient,
  range?: AnalyticsRange,
): Promise<SalonAnalytics> {
  const { since, until } = range ?? parseAnalyticsRange();
  const sinceIso = since.toISOString();
  const untilIso = until.toISOString();

  const [
    recentBookings,
    completedBookings,
    newClients,
    awaitingApproval,
    bookingRows,
    depositsPaid,
  ] = await Promise.all([
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso)
      .lte("created_at", untilIso),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", sinceIso)
      .lte("created_at", untilIso),
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
        "id, status, location_id, promotion_code, deposit_amount, deposit_paid, add_ons, services(name), created_at, client_name, start_at",
      )
      .gte("created_at", sinceIso)
      .lte("created_at", untilIso)
      .order("created_at", { ascending: false }),
    admin
      .from("bookings")
      .select("deposit_amount, deposit_paid, promotion_code, add_ons")
      .gte("created_at", sinceIso)
      .lte("created_at", untilIso)
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

  for (const loc of SALON_LOCATIONS) {
    if (!byLocation.some((b) => b.label === loc.area)) {
      byLocation.push({ label: loc.area, count: 0 });
    }
  }
  byLocation.sort((a, b) => b.count - a.count);

  return {
    since: sinceIso,
    until: untilIso,
    bookingsTotal: recentBookings.count ?? 0,
    newClientsTotal: newClients.count ?? 0,
    completedTotal: completedBookings.count ?? 0,
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
    rawRows: rows as AnalyticsBookingRow[],
  };
}

export function analyticsToCsv(stats: SalonAnalytics) {
  const lines: string[] = [
    "Glam Room analytics export",
    `From,${stats.since}`,
    `To,${stats.until}`,
    "",
    "Summary",
    `Bookings,${stats.bookingsTotal}`,
    `Completed,${stats.completedTotal}`,
    `Deposits collected (GHS),${stats.depositTotal}`,
    `Promo bookings,${stats.promoBookings}`,
    "",
    "By location",
    "Location,Count",
    ...stats.byLocation.map((r) => `${csvEscape(r.label)},${r.count}`),
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
    lines.push("", "Bookings", "Created,Start,Status,Location,Service,Client");
    for (const row of raw) {
      const svc = row.services as { name?: string } | null;
      lines.push(
        [
          csvEscape(String(row.created_at ?? "")),
          csvEscape(String(row.start_at ?? "")),
          csvEscape(String(row.status ?? "")),
          csvEscape(locationLabelFromId(row.location_id as string | null) ?? ""),
          csvEscape(svc?.name ?? ""),
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
