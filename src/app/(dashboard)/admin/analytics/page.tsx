import { createAdminClient } from "@/lib/supabase/admin";
import { loadSalonAnalytics, parseAnalyticsRange } from "@/lib/admin/analytics-data";
import { requireSuperAdmin } from "@/lib/admin/access";
import { AnalyticsBreakdownTable } from "@/components/admin/analytics-breakdown";
import {
  AdminFilterBar,
  AdminKpi,
  AdminPageHeader,
  AdminSetupNotice,
  adminBtnOutline,
} from "@/components/admin/admin-ui";

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
    <div className="space-y-5">
      <AdminPageHeader
        title="Analytics"
        description="Visit-day metrics by appointment date — stylist load, show/no-show rates, deposits, and promos."
      />

      <form action="/admin/analytics">
        <AdminFilterBar>
          <label className="text-xs text-white/65">
            From
            <input
              type="date"
              name="from"
              defaultValue={fromParam || range.since.toISOString().slice(0, 10)}
              className="mt-1 block rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs text-white/65">
            To
            <input
              type="date"
              name="to"
              defaultValue={toParam || range.until.toISOString().slice(0, 10)}
              className="mt-1 block rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
            />
          </label>
          <button type="submit" className={adminBtnOutline}>
            Apply range
          </button>
          <a href={exportHref} className={adminBtnOutline}>
            Export CSV
          </a>
        </AdminFilterBar>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpi label="Visits" value={`${stats.bookingsTotal}`} hint="by appointment date" />
        <AdminKpi label="Completed" value={`${stats.completedTotal}`} />
        <AdminKpi
          label="Show rate"
          value={`${stats.showRate}%`}
          hint={`${stats.completedTotal + stats.arrivedTotal} showed · ${stats.noShowTotal} no-show`}
        />
        <AdminKpi
          label="No-show rate"
          value={`${stats.noShowRate}%`}
          hint={`${stats.noShowTotal} no-shows in range`}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpi label="Deposits collected" value={`₵${stats.depositTotal.toLocaleString()}`} />
        <AdminKpi
          label="Deposit conversion"
          value={`${depositConversion}%`}
          hint={`${stats.depositsPaidCount} paid · ${stats.depositsPendingCount} pending`}
        />
        <AdminKpi label="Promo bookings" value={`${stats.promoBookings}`} />
        <AdminKpi
          label="Promo savings (est.)"
          value={`₵${stats.promoSavingsEstimate.toLocaleString()}`}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpi label="New clients" value={`${stats.newClientsTotal}`} hint="profile signups" />
        <AdminKpi label="Arrived" value={`${stats.arrivedTotal}`} />
        <AdminKpi label="Cancelled / rejected" value={`${stats.cancelledTotal}`} />
        <AdminKpi label="Awaiting approval" value={`${stats.awaitingApproval}`} hint="live open queue" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <AnalyticsBreakdownTable title="Visits by stylist" rows={stats.byStylist} />
        <AnalyticsBreakdownTable title="Visits by location" rows={stats.byLocation} />
        <AnalyticsBreakdownTable title="Visits by service" rows={stats.byService} />
        <AnalyticsBreakdownTable title="Visits by status" rows={stats.byStatus} />
        <AnalyticsBreakdownTable
          title="Promo code usage"
          rows={stats.byPromo}
          showAmount
          emptyMessage="No promo bookings in this range."
        />
      </div>
    </div>
  );
}
