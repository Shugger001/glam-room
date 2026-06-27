import { createAdminClient } from "@/lib/supabase/admin";
import { loadSalonAnalytics, parseAnalyticsRange } from "@/lib/admin/analytics-data";
import { requireSuperAdmin } from "@/lib/admin/access";
import { AnalyticsBreakdownTable } from "@/components/admin/analytics-breakdown";
import { AdminKpi, AdminPageHeader, AdminSetupNotice, adminBtnOutline } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Analytics" />;
  }

  await requireSuperAdmin();
  const params = await searchParams;
  const fromParam = typeof params.from === "string" ? params.from : "";
  const toParam = typeof params.to === "string" ? params.to : "";
  const range = parseAnalyticsRange(fromParam || undefined, toParam || undefined);

  const admin = createAdminClient();
  const stats = await loadSalonAnalytics(admin, range);

  const depositConversion =
    stats.depositsPaidCount + stats.depositsPendingCount > 0
      ? Math.round(
          (stats.depositsPaidCount / (stats.depositsPaidCount + stats.depositsPendingCount)) * 100,
        )
      : 0;

  const exportQs = new URLSearchParams();
  if (fromParam) exportQs.set("from", fromParam);
  if (toParam) exportQs.set("to", toParam);
  const exportHref = `/api/admin/analytics/export${exportQs.toString() ? `?${exportQs}` : ""}`;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Analytics"
        description="Bookings, deposits, promos, and location mix for your chosen date range."
      />

      <form action="/admin/analytics" className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
        <label className="text-xs text-white/65">
          From
          <input
            type="date"
            name="from"
            defaultValue={fromParam || range.since.toISOString().slice(0, 10)}
            className="mt-1 block rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-xs text-white/65">
          To
          <input
            type="date"
            name="to"
            defaultValue={toParam || range.until.toISOString().slice(0, 10)}
            className="mt-1 block rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
          />
        </label>
        <button type="submit" className={adminBtnOutline}>
          Apply range
        </button>
        <a href={exportHref} className={adminBtnOutline}>
          Export CSV
        </a>
      </form>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpi label="Bookings" value={`${stats.bookingsTotal}`} />
        <AdminKpi label="Completed" value={`${stats.completedTotal}`} />
        <AdminKpi label="Deposits collected" value={`₵${stats.depositTotal.toLocaleString()}`} />
        <AdminKpi
          label="Deposit conversion"
          value={`${depositConversion}%`}
          hint={`${stats.depositsPaidCount} paid · ${stats.depositsPendingCount} pending`}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpi label="Promo bookings" value={`${stats.promoBookings}`} />
        <AdminKpi label="Promo savings (est.)" value={`₵${stats.promoSavingsEstimate.toLocaleString()}`} />
        <AdminKpi label="New clients" value={`${stats.newClientsTotal}`} />
        <AdminKpi label="Awaiting approval" value={`${stats.awaitingApproval}`} hint="current open queue" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AnalyticsBreakdownTable title="Bookings by location" rows={stats.byLocation} />
        <AnalyticsBreakdownTable title="Bookings by service" rows={stats.byService} />
        <AnalyticsBreakdownTable
          title="Promo code usage"
          rows={stats.byPromo}
          showAmount
          emptyMessage="No promo bookings in this range."
        />
        <AnalyticsBreakdownTable title="Bookings by status" rows={stats.byStatus} />
      </div>
    </div>
  );
}
