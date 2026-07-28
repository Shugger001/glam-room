import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  bookingLocationScope,
  requireAdminAccess,
  type AdminAccess,
} from "@/lib/admin/access";
import { updateBookingStatusAction } from "@/lib/admin/update-booking-status";
import { markDepositPaidAction } from "@/lib/admin/mark-deposit-paid";
import { createWalkInBookingAction } from "@/lib/admin/walk-in-booking-action";
import { loadShopCapacityToday } from "@/lib/admin/load-shop-capacity";
import { enrichBookingsWithCrm } from "@/lib/admin/enrich-bookings-crm";
import {
  BookingsByTimeGroups,
  type AdminBookingRow,
} from "@/components/admin/bookings-table";
import { WalkInBookingForm } from "@/components/admin/walk-in-booking-form";
import { BulkApproveBar } from "@/components/admin/bulk-approve-bar";
import { BulkChaseDepositsBar, type ChaseDepositTarget } from "@/components/admin/bulk-chase-deposits-bar";
import { ShopCapacityStrip } from "@/components/admin/shop-capacity-strip";
import { AdminQuickLinks } from "@/components/admin/admin-quick-links";
import {
  AdminIntegrationSnapshot,
  loadAdminIntegrationSnapshot,
} from "@/components/admin/admin-integration-snapshot";
import {
  AdminKpi,
  AdminPageHeader,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";
import { SALON_SERVICES, type SalonService } from "@/lib/constants/services";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const bookingSelect =
  "id, start_at, status, location_id, staff_id, client_name, client_phone, client_notes, admin_notes, deposit_paid, deposit_amount, paystack_reference, promotion_code, profiles(full_name,phone,crm_tags,admin_notes), services(name), staff(name)";

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function loadTodayStats(admin: ReturnType<typeof createAdminClient>, locationScope: string | null) {
  const { start, end } = dayBounds();
  let query = admin
    .from("bookings")
    .select("status, deposit_paid, deposit_amount")
    .gte("start_at", start.toISOString())
    .lte("start_at", end.toISOString());
  if (locationScope) query = query.eq("location_id", locationScope);
  const { data } = await query;
  const rows = data ?? [];
  return {
    total: rows.length,
    awaiting: rows.filter((r) => r.status === "awaiting_approval" || r.status === "pending").length,
    confirmed: rows.filter((r) => r.status === "confirmed").length,
    arrived: rows.filter((r) => r.status === "arrived").length,
    completed: rows.filter((r) => r.status === "completed").length,
    unpaidDeposits: rows.filter(
      (r) =>
        !r.deposit_paid &&
        typeof r.deposit_amount === "number" &&
        Number(r.deposit_amount) > 0,
    ).length,
  };
}

async function countPaidAwaiting(
  admin: ReturnType<typeof createAdminClient>,
  locationScope: string | null,
) {
  let query = admin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "awaiting_approval"])
    .eq("deposit_paid", true);
  if (locationScope) query = query.eq("location_id", locationScope);
  const { count } = await query;
  return count ?? 0;
}

function mapServices(
  serviceRows: { id: string; name: string; description: string | null; duration_minutes: number; base_price: number; slug: string | null; featured: boolean | null }[] | null,
): SalonService[] {
  if (!serviceRows || serviceRows.length === 0) return SALON_SERVICES;
  return serviceRows
    .map((row) => ({
      id: row.id,
      slug: row.slug ?? row.id,
      name: row.name,
      description: row.description ?? "",
      category: "hair-reset" as const,
      durationMinutes: Number(row.duration_minutes),
      price: Number(row.base_price),
      image: "/images/glam-braids-studio.png",
      featured: row.featured === true,
    }))
    .filter((s) => s.name && s.durationMinutes);
}

async function loadTodayBookings(
  admin: ReturnType<typeof createAdminClient>,
  locationScope: string | null,
) {
  const { start, end } = dayBounds();
  let query = admin
    .from("bookings")
    .select(bookingSelect)
    .gte("start_at", start.toISOString())
    .lte("start_at", end.toISOString())
    .order("start_at", { ascending: true })
    .limit(80);
  if (locationScope) query = query.eq("location_id", locationScope);
  const { data } = await query;
  return enrichBookingsWithCrm(admin, (data ?? []) as AdminBookingRow[]);
}

function chaseTargetsFromBookings(bookings: AdminBookingRow[]): ChaseDepositTarget[] {
  return bookings
    .filter(
      (b) =>
        !b.deposit_paid &&
        typeof b.deposit_amount === "number" &&
        Number(b.deposit_amount) > 0 &&
        (b.status === "awaiting_approval" || b.status === "confirmed" || b.status === "pending") &&
        Boolean(b.client_phone ?? b.profiles?.phone),
    )
    .map((b) => ({
      id: b.id,
      clientName: b.client_name ?? b.profiles?.full_name ?? "Guest",
      clientPhone: b.client_phone ?? b.profiles?.phone ?? "",
      serviceName: b.services?.name ?? "Service",
      when: new Date(b.start_at).toLocaleString(),
      amountLabel: `₵${Number(b.deposit_amount).toFixed(0)}`,
    }));
}

async function StaffDashboard({ access }: { access: AdminAccess }) {
  const admin = createAdminClient();
  const locationScope = bookingLocationScope(access);

  const [stats, capacityRows, paidAwaitingCount, todayBookings, staffService] = await Promise.all([
    loadTodayStats(admin, locationScope),
    loadShopCapacityToday(admin, locationScope),
    countPaidAwaiting(admin, locationScope),
    loadTodayBookings(admin, locationScope),
    Promise.all([
      admin.from("staff").select("id, name").eq("active", true).order("sort_order"),
      admin
        .from("services")
        .select("id, name, description, duration_minutes, base_price, category, slug, image_url, featured, active, sort_order")
        .eq("active", true)
        .order("sort_order"),
    ]),
  ]);

  const [{ data: staffRows }, { data: serviceRows }] = staffService;
  const chaseTargets = chaseTargetsFromBookings(todayBookings);

  const kpis = [
    { label: "Today", value: `${stats.total}`, hint: "scheduled", href: "/admin/appointments?range=today" },
    { label: "Awaiting", value: `${stats.awaiting}`, href: "/admin/appointments?range=today&status=awaiting_approval" },
    { label: "On floor", value: `${stats.arrived}`, href: "/admin/appointments?range=today&status=arrived" },
    { label: "Unpaid deposits", value: `${stats.unpaidDeposits}`, href: "/admin/appointments?range=today&status=awaiting_approval" },
  ];

  return (
    <div className="space-y-10 w-full max-w-none">
      <AdminPageHeader
        title={`Today · ${access.assignedLocationLabel ?? "Shop"}`}
        description="Your shop schedule. Confirm walk-ins, update status, and message clients on WhatsApp."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <AdminKpi key={k.label} {...k} />
        ))}
      </div>
      <ShopCapacityStrip shops={capacityRows} />
      <BulkApproveBar paidAwaitingCount={paidAwaitingCount} locationId={access.assignedLocationId} />
      <BulkChaseDepositsBar targets={chaseTargets} />
      <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8">
        <WalkInBookingForm
          services={mapServices(serviceRows)}
          staff={(staffRows ?? []).map((s) => ({ id: s.id, name: s.name }))}
          defaultLocationId={access.assignedLocationId}
          createWalkInBooking={createWalkInBookingAction}
        />
      </section>
      <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Today&apos;s schedule</h2>
            <p className="mt-2 text-sm text-white/55">Grouped by time — tap status or WhatsApp as clients arrive.</p>
          </div>
          <a
            href="/admin/appointments?range=today"
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:bg-white/10"
          >
            Full appointments
          </a>
        </div>
        <div className="mt-5">
          <BookingsByTimeGroups
            bookings={todayBookings}
            updateBookingStatus={updateBookingStatusAction}
            markDepositPaid={markDepositPaidAction}
            staffOptions={(staffRows ?? []).map((s) => ({ id: s.id, name: s.name }))}
          />
        </div>
      </section>
    </div>
  );
}

async function SuperAdminDashboard() {
  const admin = createAdminClient();

  const [
    stats,
    capacityRows,
    paidAwaitingCount,
    todayBookings,
    integrationHealth,
    queueRes,
    messagesRes,
    staffService,
  ] = await Promise.all([
    loadTodayStats(admin, null),
    loadShopCapacityToday(admin, null),
    countPaidAwaiting(admin, null),
    loadTodayBookings(admin, null),
    loadAdminIntegrationSnapshot(admin),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "awaiting_approval", "confirmed"]),
    admin.from("contact_messages").select("id", { count: "exact", head: true }).is("read_at", null),
    Promise.all([
      admin.from("staff").select("id, name").eq("active", true).order("sort_order"),
      admin
        .from("services")
        .select("id, name, description, duration_minutes, base_price, category, slug, image_url, featured, active, sort_order")
        .eq("active", true)
        .order("sort_order"),
    ]),
  ]);

  const [{ data: staffRows }, { data: serviceRows }] = staffService;
  const chaseTargets = chaseTargetsFromBookings(todayBookings);

  const kpis = [
    { label: "Today", value: `${stats.total}`, hint: "all shops", href: "/admin/appointments?range=today" },
    { label: "Open queue", value: `${queueRes.count ?? 0}`, href: "/admin/appointments?status=awaiting_approval" },
    { label: "On floor", value: `${stats.arrived}`, href: "/admin/appointments?range=today&status=arrived" },
    { label: "Done today", value: `${stats.completed}`, href: "/admin/appointments?range=today&status=completed" },
    { label: "Unread messages", value: `${messagesRes.count ?? 0}`, href: "/admin/messages?filter=unread" },
    { label: "Unpaid deposits", value: `${stats.unpaidDeposits}`, href: "/admin/appointments?status=awaiting_approval" },
  ];

  return (
    <div className="space-y-10 w-full max-w-none">
      <AdminPageHeader
        title="At-a-glance"
        description="Today's salon operations across all shops — capacity, approvals, and floor status."
      />
      <AdminQuickLinks />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <AdminKpi key={k.label} {...k} />
        ))}
      </div>
      <ShopCapacityStrip shops={capacityRows} />
      <BulkApproveBar paidAwaitingCount={paidAwaitingCount} />
      <BulkChaseDepositsBar targets={chaseTargets} />
      <AdminIntegrationSnapshot health={integrationHealth} />
      <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8">
        <WalkInBookingForm
          services={mapServices(serviceRows)}
          staff={(staffRows ?? []).map((s) => ({ id: s.id, name: s.name }))}
          createWalkInBooking={createWalkInBookingAction}
        />
      </section>
      <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Today&apos;s schedule</h2>
            <p className="mt-2 text-sm text-white/55">All shops · grouped by appointment time.</p>
          </div>
          <a
            href="/admin/appointments?range=today"
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:bg-white/10"
          >
            Manage appointments
          </a>
        </div>
        <div className="mt-5">
          <BookingsByTimeGroups
            bookings={todayBookings}
            updateBookingStatus={updateBookingStatusAction}
            markDepositPaid={markDepositPaidAction}
            staffOptions={(staffRows ?? []).map((s) => ({ id: s.id, name: s.name }))}
          />
        </div>
      </section>
    </div>
  );
}

export default async function AdminOverviewPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }

  const access = await requireAdminAccess();
  if (!access.isSuperAdmin) {
    return <StaffDashboard access={access} />;
  }

  return <SuperAdminDashboard />;
}
