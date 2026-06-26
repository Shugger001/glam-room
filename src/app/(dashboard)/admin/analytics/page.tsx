import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { AdminKpi, AdminPageHeader, AdminSetupNotice } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Analytics" />;
  }

  await requireSuperAdmin();

  const admin = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [recentBookings, completedBookings, newClients] = await Promise.all([
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Analytics"
        description="30-day performance overview for The Glam Room."
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <AdminKpi label="Bookings (30d)" value={`${recentBookings.count ?? 0}`} />
        <AdminKpi label="New clients (30d)" value={`${newClients.count ?? 0}`} />
        <AdminKpi label="Completed (30d)" value={`${completedBookings.count ?? 0}`} />
      </div>
    </div>
  );
}
