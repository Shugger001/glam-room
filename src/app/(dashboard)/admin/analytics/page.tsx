import { createAdminClient } from "@/lib/supabase/admin";
import { loadSalonAnalytics } from "@/lib/admin/analytics-data";
import { requireSuperAdmin } from "@/lib/admin/access";
import { AnalyticsBreakdownTable } from "@/components/admin/analytics-breakdown";
import { AdminKpi, AdminPageHeader, AdminSetupNotice } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Analytics" />;
  }

  await requireSuperAdmin();
  const admin = createAdminClient();
  const stats = await loadSalonAnalytics(admin);

  const depositConversion =
    stats.depositsPaidCount + stats.depositsPendingCount > 0
      ? Math.round(
          (stats.depositsPaidCount /
            (stats.depositsPaidCount + stats.depositsPendingCount)) *
            100,
        )
      : 0;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Analytics"
        description="30-day performance: bookings, deposits, promos, and location mix."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpi label="Bookings (30d)" value={`${stats.bookings30d}`} />
        <AdminKpi label="Completed (30d)" value={`${stats.completed30d}`} />
        <AdminKpi label="Deposits collected (30d)" value={`₵${stats.depositTotal.toLocaleString()}`} />
        <AdminKpi
          label="Deposit conversion"
          value={`${depositConversion}%`}
          hint={`${stats.depositsPaidCount} paid · ${stats.depositsPendingCount} pending`}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpi label="Promo bookings (30d)" value={`${stats.promoBookings}`} />
        <AdminKpi
          label="Promo savings (est.)"
          value={`₵${stats.promoSavingsEstimate.toLocaleString()}`}
        />
        <AdminKpi label="New clients (30d)" value={`${stats.newClients30d}`} />
        <AdminKpi
          label="Awaiting approval"
          value={`${stats.awaitingApproval}`}
          hint="needs confirmation"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AnalyticsBreakdownTable title="Bookings by location" rows={stats.byLocation} />
        <AnalyticsBreakdownTable title="Bookings by service" rows={stats.byService} />
        <AnalyticsBreakdownTable
          title="Promo code usage"
          rows={stats.byPromo}
          showAmount
          emptyMessage="No promo bookings in the last 30 days."
        />
        <AnalyticsBreakdownTable title="Bookings by status" rows={stats.byStatus} />
      </div>
    </div>
  );
}
