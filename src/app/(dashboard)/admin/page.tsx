import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatShopPrice } from "@/lib/format/money";
import { AdminKpi, AdminPageHeader, AdminSetupNotice, AdminCard } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }

  const admin = createAdminClient();
  const [bookingsRes, profilesRes, servicesRes, messagesRes, testimonialsRes] = await Promise.all([
    admin
      .from("bookings")
      .select("id, deposit_amount, deposit_paid", { count: "exact" })
      .in("status", ["pending", "awaiting_approval", "confirmed"]),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("services").select("id", { count: "exact", head: true }).eq("active", true),
    admin
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
    admin.from("testimonials").select("id", { count: "exact", head: true }).eq("published", true),
  ]);

  const pendingDeposits = (bookingsRes.data ?? []).filter((b) => !b.deposit_paid).length;
  const depositRevenue = (bookingsRes.data ?? [])
    .filter((b) => b.deposit_paid)
    .reduce((sum, b) => sum + Number(b.deposit_amount ?? 0), 0);

  const kpis = [
    { label: "Open Appointments", value: `${bookingsRes.count ?? 0}`, hint: "Pending & confirmed" },
    { label: "Total Clients", value: `${profilesRes.count ?? 0}` },
    { label: "Active Services", value: `${servicesRes.count ?? 0}` },
    { label: "Unread Messages", value: `${messagesRes.count ?? 0}` },
    { label: "Deposits Collected", value: formatShopPrice(depositRevenue) },
    { label: "Pending Deposits", value: `${pendingDeposits}` },
    { label: "Published Reviews", value: `${testimonialsRes.count ?? 0}` },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Dashboard"
        description="Salon operations at a glance — appointments, clients, and revenue."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <AdminKpi key={k.label} {...k} />
        ))}
      </div>
      <AdminCard>
        <h2 className="heading-display text-2xl text-white">Quick Actions</h2>
        <ul className="mt-4 space-y-2 text-sm text-white/70">
          <li>→ Review pending appointments in Appointments</li>
          <li>→ Respond to contact form submissions</li>
          <li>→ Update services and pricing as needed</li>
          <li>→ Manage gallery and testimonials content</li>
        </ul>
      </AdminCard>
    </div>
  );
}
