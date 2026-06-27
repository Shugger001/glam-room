import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { updateBookingStatusAction } from "@/lib/admin/update-booking-status";
import { BookingsTable, type AdminBookingRow } from "@/components/admin/bookings-table";
import {
  AdminKpi,
  AdminPageHeader,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export default async function AdminOverviewPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }

  await requireSuperAdmin();

  const admin = createAdminClient();
  const { start, end } = dayBounds();

  const [bookingsRes, profilesRes, servicesRes, messagesRes, pendingDepositsRes, todayRes, recentBookingsRes] =
    await Promise.all([
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
      admin
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("deposit_paid", false)
        .gt("deposit_amount", 0)
        .in("status", ["awaiting_approval", "confirmed", "pending"]),
      admin
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("start_at", start.toISOString())
        .lte("start_at", end.toISOString()),
      admin
        .from("bookings")
        .select(
          "id, start_at, status, location_id, staff_id, client_name, client_phone, client_notes, admin_notes, deposit_paid, deposit_amount, paystack_reference, promotion_code, profiles(full_name,phone), services(name), staff(name)",
        )
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const kpis = [
    {
      label: "Today",
      value: `${todayRes.count ?? 0}`,
      hint: "appointments scheduled",
      href: "/admin/appointments?range=today",
    },
    {
      label: "Open appointments",
      value: `${bookingsRes.count ?? 0}`,
      hint: "pending + confirmed",
      href: "/admin/appointments?status=awaiting_approval",
    },
    {
      label: "Unread messages",
      value: `${messagesRes.count ?? 0}`,
      hint: "contact form inbox",
      href: "/admin/messages?filter=unread",
    },
    {
      label: "Unpaid deposits",
      value: `${pendingDepositsRes.count ?? 0}`,
      hint: "awaiting Paystack",
      href: "/admin/appointments?status=awaiting_approval",
    },
    {
      label: "Active services",
      value: `${servicesRes.count ?? 0}`,
      hint: "live on site",
      href: "/admin/services",
    },
    {
      label: "Total clients",
      value: `${profilesRes.count ?? 0}`,
      hint: "profiles",
      href: "/admin/customers",
    },
  ];

  return (
    <div className="space-y-10 w-full max-w-none">
      <AdminPageHeader
        title="At-a-glance"
        description="Today's salon operations. Confirm bookings, reply to messages, and chase unpaid deposits."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <AdminKpi key={k.label} {...k} />
        ))}
      </div>
      <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Latest bookings</h2>
            <p className="mt-2 text-sm text-white/55">
              Newest requests from the website. Open Appointments for the full command center.
            </p>
          </div>
          <a
            href="/admin/appointments?range=today"
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:bg-white/10"
          >
            Today&apos;s schedule
          </a>
        </div>
        <div className="mt-5">
          <BookingsTable
            bookings={(recentBookingsRes.data ?? []) as AdminBookingRow[]}
            updateBookingStatus={updateBookingStatusAction}
            showReschedule={false}
            showStaff={false}
            showOps={false}
            emptyMessage="No bookings yet."
          />
        </div>
      </section>
    </div>
  );
}
