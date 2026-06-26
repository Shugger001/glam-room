import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
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
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "awaiting_approval", "confirmed"]),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("services").select("id", { count: "exact", head: true }).eq("active", true),
    admin
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
    admin.from("testimonials").select("id", { count: "exact", head: true }).eq("published", true),
  ]);

  const kpis = [
    {
      label: "Open Appointments",
      value: `${bookingsRes.count ?? 0}`,
      hint: "Pending & confirmed",
      href: "/admin/appointments",
    },
    { label: "Total Clients", value: `${profilesRes.count ?? 0}` },
    { label: "Active Services", value: `${servicesRes.count ?? 0}`, href: "/admin/services" },
    {
      label: "Unread Messages",
      value: `${messagesRes.count ?? 0}`,
      href: "/admin/messages",
    },
    {
      label: "Published Reviews",
      value: `${testimonialsRes.count ?? 0}`,
      href: "/admin/testimonials",
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Dashboard"
        description="Salon operations at a glance — appointments, clients, and messages."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <AdminKpi key={k.label} {...k} />
        ))}
      </div>
      <AdminCard>
        <h2 className="heading-display text-2xl text-white">Quick Actions</h2>
        <ul className="mt-4 space-y-2 text-sm text-white/70">
          <li>
            →{" "}
            <a href="/admin/appointments" className="text-glam-accent hover:underline">
              Review pending appointments
            </a>
          </li>
          <li>
            →{" "}
            <a href="/admin/messages" className="text-glam-accent hover:underline">
              Respond to contact form submissions
            </a>
          </li>
          <li>
            →{" "}
            <a href="/admin/services" className="text-glam-accent hover:underline">
              Update services and pricing
            </a>
          </li>
          <li>
            →{" "}
            <a href="/admin/gallery" className="text-glam-accent hover:underline">
              Manage gallery and testimonials
            </a>
          </li>
        </ul>
      </AdminCard>
    </div>
  );
}
