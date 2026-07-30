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
import { StaffClockStrip } from "@/components/admin/staff-clock-strip";
import { AdminQuickLinks } from "@/components/admin/admin-quick-links";
import {
  AdminIntegrationSnapshot,
  loadAdminIntegrationSnapshot,
} from "@/components/admin/admin-integration-snapshot";
import {
  AdminKpi,
  AdminPageHeader,
  AdminSection,
  AdminSetupNotice,
  adminBtnOutline,
  adminTabClass,
} from "@/components/admin/admin-ui";
import { loadStaffPresence } from "@/lib/admin/staff-clock";
import { cn } from "@/lib/utils/cn";
import { SALON_SERVICES, isServiceCategory, type SalonService } from "@/lib/constants/services";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const bookingSelect =
  "id, start_at, status, location_id, staff_id, client_name, client_phone, client_notes, admin_notes, deposit_paid, deposit_amount, paystack_reference, promotion_code, profiles(full_name,phone,crm_tags,admin_notes), services(name), staff(name)";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function filterTodayBoard(
  bookings: AdminBookingRow[],
  q: string,
  depositFilter: "all" | "paid" | "unpaid",
  statusFilter: string,
) {
  const needle = q.toLowerCase();
  return bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;

    if (depositFilter !== "all") {
      const due = typeof b.deposit_amount === "number" && Number(b.deposit_amount) > 0;
      if (!due) {
        if (depositFilter === "unpaid") return false;
      } else if (depositFilter === "paid" ? !b.deposit_paid : Boolean(b.deposit_paid)) {
        return false;
      }
    }

    if (!needle) return true;
    const name = (b.client_name ?? b.profiles?.full_name ?? "").toLowerCase();
    const phone = (b.client_phone ?? b.profiles?.phone ?? "").toLowerCase();
    return name.includes(needle) || phone.includes(needle);
  });
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
  serviceRows: {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    base_price: number;
    slug: string | null;
    featured: boolean | null;
    category?: string | null;
    location_ids?: string[] | null;
  }[] | null,
): SalonService[] {
  if (!serviceRows || serviceRows.length === 0) return SALON_SERVICES;
  return serviceRows
    .map((row) => {
      const categoryRaw = row.category ?? "hair-reset";
      const category = isServiceCategory(categoryRaw) ? categoryRaw : "hair-reset";
      const locationIds = Array.isArray(row.location_ids)
        ? row.location_ids.filter((v): v is string => typeof v === "string")
        : null;
      return {
        id: row.id,
        slug: row.slug ?? row.id,
        name: row.name,
        description: row.description ?? "",
        category,
        durationMinutes: Number(row.duration_minutes),
        price: Number(row.base_price),
        image: "/images/glam-braids-studio.png",
        featured: row.featured === true,
        locationIds: locationIds && locationIds.length > 0 ? locationIds : null,
      } satisfies SalonService;
    })
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

function TodayBoardFilters({
  q,
  depositFilter,
  statusFilter,
}: {
  q: string;
  depositFilter: "all" | "paid" | "unpaid";
  statusFilter: string;
}) {
  const statusTabs = [
    "all",
    "pending",
    "awaiting_approval",
    "confirmed",
    "arrived",
    "completed",
    "no_show",
  ] as const;

  function href(next: Record<string, string>) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (depositFilter !== "all") qs.set("deposit", depositFilter);
    if (statusFilter !== "all") qs.set("status", statusFilter);
    Object.entries(next).forEach(([k, v]) => {
      if (v) qs.set(k, v);
      else qs.delete(k);
    });
    const s = qs.toString();
    return s ? `/admin?${s}` : "/admin";
  }

  return (
    <div className="mb-4 space-y-3">
      <form action="/admin" className="flex flex-wrap items-end gap-2">
        {depositFilter !== "all" ? <input type="hidden" name="deposit" value={depositFilter} /> : null}
        {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}
        <label className="text-xs text-white/65">
          Search today
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Name or phone"
            className="mt-1 block w-52 rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white sm:w-64"
          />
        </label>
        <button type="submit" className={adminBtnOutline}>
          Filter
        </button>
        {q || depositFilter !== "all" || statusFilter !== "all" ? (
          <a href="/admin" className="text-xs font-semibold uppercase tracking-wider text-glam-accent hover:text-white">
            Clear
          </a>
        ) : null}
      </form>

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-white/45">Deposit</span>
        {(
          [
            ["all", "All"],
            ["unpaid", "Unpaid"],
            ["paid", "Paid"],
          ] as const
        ).map(([value, label]) => (
          <a
            key={value}
            href={href({ deposit: value === "all" ? "" : value })}
            className={cn(adminTabClass(depositFilter === value), "shrink-0")}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {statusTabs.map((tab) => (
          <a
            key={tab}
            href={href({ status: tab === "all" ? "" : tab })}
            className={cn(adminTabClass(statusFilter === tab), "shrink-0")}
          >
            {tab.replaceAll("_", " ")}
          </a>
        ))}
      </div>
    </div>
  );
}

async function StaffDashboard({
  access,
  q,
  depositFilter,
  statusFilter,
}: {
  access: AdminAccess;
  q: string;
  depositFilter: "all" | "paid" | "unpaid";
  statusFilter: string;
}) {
  const admin = createAdminClient();
  const locationScope = bookingLocationScope(access);

  const [stats, capacityRows, paidAwaitingCount, todayBookings, presence, staffService] =
    await Promise.all([
      loadTodayStats(admin, locationScope),
      loadShopCapacityToday(admin, locationScope),
      countPaidAwaiting(admin, locationScope),
      loadTodayBookings(admin, locationScope),
      loadStaffPresence(admin, locationScope),
      Promise.all([
        admin
          .from("staff")
          .select("id, name, home_location_id")
          .eq("active", true)
          .eq("is_front_desk", false)
          .order("sort_order"),
        admin
          .from("services")
          .select(
            "id, name, description, duration_minutes, base_price, category, slug, image_url, featured, active, sort_order, location_ids",
          )
          .eq("active", true)
          .order("sort_order"),
      ]),
    ]);

  const [{ data: staffRows }, { data: serviceRows }] = staffService;
  const visibleBookings = filterTodayBoard(todayBookings, q, depositFilter, statusFilter);
  const chaseTargets = chaseTargetsFromBookings(todayBookings);
  const staffOnFloor = presence.filter(
    (m) => m.openShift && (!locationScope || m.openShift.locationId === locationScope),
  ).length;

  const kpis = [
    { label: "Today", value: `${stats.total}`, hint: "scheduled", href: "/admin/appointments?range=today" },
    { label: "Awaiting", value: `${stats.awaiting}`, href: "/admin/appointments?range=today&status=awaiting_approval" },
    { label: "Clients on floor", value: `${stats.arrived}`, href: "/admin/appointments?range=today&status=arrived" },
    { label: "Staff in", value: `${staffOnFloor}`, href: "/admin/attendance" },
    { label: "Unpaid deposits", value: `${stats.unpaidDeposits}`, href: "/admin?deposit=unpaid" },
  ];

  return (
    <div className="w-full max-w-none space-y-6">
      <AdminPageHeader
        title={`Today · ${access.assignedLocationLabel ?? "Shop"}`}
        description="Confirm walk-ins, update status, and message clients on WhatsApp."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <AdminKpi key={k.label} {...k} />
        ))}
      </div>
      <ShopCapacityStrip shops={capacityRows} />
      <StaffClockStrip
        members={presence}
        locationScope={locationScope}
        isSuperAdmin={false}
        shopLabel={access.assignedLocationLabel}
      />
      <BulkApproveBar paidAwaitingCount={paidAwaitingCount} locationId={access.assignedLocationId} />
      <BulkChaseDepositsBar targets={chaseTargets} />
      <WalkInBookingForm
        services={mapServices(serviceRows)}
        staff={(staffRows ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          homeLocationId: (s as { home_location_id?: string | null }).home_location_id ?? null,
        }))}
        defaultLocationId={access.assignedLocationId}
        createWalkInBooking={createWalkInBookingAction}
      />
      <AdminSection
        title="Today's schedule"
        description="Grouped by time — WhatsApp and floor actions on each card."
        action={
          <a href="/admin/appointments?range=today" className={adminBtnOutline}>
            Full appointments
          </a>
        }
      >
        <TodayBoardFilters q={q} depositFilter={depositFilter} statusFilter={statusFilter} />
        <p className="mb-3 text-xs text-white/45">
          {visibleBookings.length} of {todayBookings.length} today
        </p>
        <BookingsByTimeGroups
          bookings={visibleBookings}
          updateBookingStatus={updateBookingStatusAction}
          markDepositPaid={markDepositPaidAction}
          staffOptions={(staffRows ?? []).map((s) => ({
            id: s.id,
            name: s.name,
            homeLocationId: (s as { home_location_id?: string | null }).home_location_id ?? null,
          }))}
        />
      </AdminSection>
    </div>
  );
}

async function SuperAdminDashboard({
  q,
  depositFilter,
  statusFilter,
}: {
  q: string;
  depositFilter: "all" | "paid" | "unpaid";
  statusFilter: string;
}) {
  const admin = createAdminClient();

  const [
    stats,
    capacityRows,
    paidAwaitingCount,
    todayBookings,
    presence,
    integrationHealth,
    queueRes,
    messagesRes,
    staffService,
  ] = await Promise.all([
    loadTodayStats(admin, null),
    loadShopCapacityToday(admin, null),
    countPaidAwaiting(admin, null),
    loadTodayBookings(admin, null),
    loadStaffPresence(admin, null),
    loadAdminIntegrationSnapshot(admin),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "awaiting_approval", "confirmed"]),
    admin.from("contact_messages").select("id", { count: "exact", head: true }).is("read_at", null),
    Promise.all([
      admin
        .from("staff")
        .select("id, name, home_location_id")
        .eq("active", true)
        .eq("is_front_desk", false)
        .order("sort_order"),
      admin
        .from("services")
        .select(
          "id, name, description, duration_minutes, base_price, category, slug, image_url, featured, active, sort_order, location_ids",
        )
        .eq("active", true)
        .order("sort_order"),
    ]),
  ]);

  const [{ data: staffRows }, { data: serviceRows }] = staffService;
  const visibleBookings = filterTodayBoard(todayBookings, q, depositFilter, statusFilter);
  const chaseTargets = chaseTargetsFromBookings(todayBookings);
  const staffOnFloor = presence.filter((m) => m.openShift).length;

  const kpis = [
    { label: "Today", value: `${stats.total}`, hint: "all shops", href: "/admin/appointments?range=today" },
    { label: "Open queue", value: `${queueRes.count ?? 0}`, href: "/admin/appointments?status=awaiting_approval" },
    { label: "Clients on floor", value: `${stats.arrived}`, href: "/admin/appointments?range=today&status=arrived" },
    { label: "Staff in", value: `${staffOnFloor}`, href: "/admin/attendance" },
    { label: "Done today", value: `${stats.completed}`, href: "/admin/appointments?range=today&status=completed" },
    { label: "Unread messages", value: `${messagesRes.count ?? 0}`, href: "/admin/messages?filter=unread" },
    { label: "Unpaid deposits", value: `${stats.unpaidDeposits}`, href: "/admin?deposit=unpaid" },
  ];

  return (
    <div className="w-full max-w-none space-y-6">
      <AdminPageHeader
        title="At-a-glance"
        description="Today's salon operations across all shops — capacity, approvals, and floor status."
      />
      <AdminQuickLinks />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <AdminKpi key={k.label} {...k} />
        ))}
      </div>
      <ShopCapacityStrip shops={capacityRows} />
      <StaffClockStrip members={presence} locationScope={null} isSuperAdmin />
      <BulkApproveBar paidAwaitingCount={paidAwaitingCount} />
      <BulkChaseDepositsBar targets={chaseTargets} />
      <AdminIntegrationSnapshot health={integrationHealth} />
      <WalkInBookingForm
        services={mapServices(serviceRows)}
        staff={(staffRows ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          homeLocationId: (s as { home_location_id?: string | null }).home_location_id ?? null,
        }))}
        createWalkInBooking={createWalkInBookingAction}
      />
      <AdminSection
        title="Today's schedule"
        description="All shops · grouped by appointment time."
        action={
          <a href="/admin/appointments?range=today" className={adminBtnOutline}>
            Manage appointments
          </a>
        }
      >
        <TodayBoardFilters q={q} depositFilter={depositFilter} statusFilter={statusFilter} />
        <p className="mb-3 text-xs text-white/45">
          {visibleBookings.length} of {todayBookings.length} today
        </p>
        <BookingsByTimeGroups
          bookings={visibleBookings}
          updateBookingStatus={updateBookingStatusAction}
          markDepositPaid={markDepositPaidAction}
          staffOptions={(staffRows ?? []).map((s) => ({
            id: s.id,
            name: s.name,
            homeLocationId: (s as { home_location_id?: string | null }).home_location_id ?? null,
          }))}
        />
      </AdminSection>
    </div>
  );
}

export default async function AdminOverviewPage({ searchParams }: { searchParams: SearchParams }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const depositParam = typeof params.deposit === "string" ? params.deposit : "all";
  const depositFilter =
    depositParam === "paid" || depositParam === "unpaid" ? depositParam : "all";
  const statusParam = typeof params.status === "string" ? params.status : "all";
  const statusFilter = statusParam || "all";

  const access = await requireAdminAccess();
  if (!access.isSuperAdmin) {
    return (
      <StaffDashboard
        access={access}
        q={q}
        depositFilter={depositFilter}
        statusFilter={statusFilter}
      />
    );
  }

  return (
    <SuperAdminDashboard q={q} depositFilter={depositFilter} statusFilter={statusFilter} />
  );
}
