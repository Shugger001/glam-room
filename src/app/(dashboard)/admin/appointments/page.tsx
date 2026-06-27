import { createAdminClient } from "@/lib/supabase/admin";
import {
  bookingLocationScope,
  requireAdminAccess,
} from "@/lib/admin/access";
import { updateBookingStatusAction } from "@/lib/admin/update-booking-status";
import { BookingsTable, type AdminBookingRow } from "@/components/admin/bookings-table";
import { AppointmentStats } from "@/components/admin/appointment-stats";
import {
  adminBtnOutline,
  AdminPanel,
  adminTabClass,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

const statusTabs = [
  "all",
  "pending",
  "awaiting_approval",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
] as const;

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function weekBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminAppointmentsPage({ searchParams }: { searchParams: SearchParams }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Appointments" />;
  }

  const access = await requireAdminAccess();
  const locationScope = bookingLocationScope(access);

  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : "all";
  const statusFilter = statusTabs.includes(statusParam as (typeof statusTabs)[number])
    ? statusParam
    : "all";
  const rangeParam = typeof params.range === "string" ? params.range : "today";
  const rangeFilter = rangeParam === "week" || rangeParam === "all" ? rangeParam : "today";
  const fromDate = typeof params.from === "string" ? params.from : "";
  const toDate = typeof params.to === "string" ? params.to : "";
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const admin = createAdminClient();

  const bookingSelect =
    "id, start_at, status, location_type, location_id, staff_id, client_name, client_phone, client_notes, admin_notes, deposit_paid, deposit_amount, paystack_reference, promotion_code, profiles(full_name,phone), services(name), staff(name)";

  let query = admin.from("bookings").select(bookingSelect).order("start_at", { ascending: true });
  if (locationScope) query = query.eq("location_id", locationScope);
  if (statusFilter !== "all") query = query.eq("status", statusFilter);
  if (q.length > 0) {
    query = query.or(`client_name.ilike.%${q}%,client_phone.ilike.%${q}%`);
  }

  if (fromDate || toDate) {
    if (fromDate) query = query.gte("start_at", new Date(fromDate).toISOString());
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte("start_at", end.toISOString());
    }
  } else if (rangeFilter === "today") {
    const { start, end } = dayBounds();
    query = query.gte("start_at", start.toISOString()).lte("start_at", end.toISOString());
  } else if (rangeFilter === "week") {
    const { start, end } = weekBounds();
    query = query.gte("start_at", start.toISOString()).lte("start_at", end.toISOString());
  }

  const [{ data }, { data: staffRows }, statsRes] = await Promise.all([
    query.limit(100),
    admin.from("staff").select("id, name").eq("active", true).order("sort_order"),
    (async () => {
      const { start, end } = dayBounds();
      let statsQuery = admin
        .from("bookings")
        .select("status, deposit_paid, deposit_amount")
        .gte("start_at", start.toISOString())
        .lte("start_at", end.toISOString());
      if (locationScope) statsQuery = statsQuery.eq("location_id", locationScope);
      return statsQuery;
    })(),
  ]);

  const todayRows = statsRes.data ?? [];
  const stats = [
    {
      label: "Today total",
      value: todayRows.length,
      href: "/admin/appointments?range=today",
      highlight: rangeFilter === "today",
    },
    {
      label: "Awaiting approval",
      value: todayRows.filter((r) => r.status === "awaiting_approval" || r.status === "pending").length,
      href: "/admin/appointments?range=today&status=awaiting_approval",
    },
    {
      label: "Confirmed today",
      value: todayRows.filter((r) => r.status === "confirmed").length,
      href: "/admin/appointments?range=today&status=confirmed",
    },
    {
      label: "Unpaid deposits",
      value: todayRows.filter(
        (r) =>
          !r.deposit_paid &&
          typeof r.deposit_amount === "number" &&
          Number(r.deposit_amount) > 0 &&
          (r.status === "awaiting_approval" || r.status === "confirmed" || r.status === "pending"),
      ).length,
      href: "/admin/appointments?range=today&status=awaiting_approval",
    },
  ];

  function buildHref(next: Record<string, string>) {
    const qs = new URLSearchParams();
    if (statusFilter !== "all") qs.set("status", statusFilter);
    if (rangeFilter !== "today") qs.set("range", rangeFilter);
    if (fromDate) qs.set("from", fromDate);
    if (toDate) qs.set("to", toDate);
    if (q) qs.set("q", q);
    Object.entries(next).forEach(([k, v]) => {
      if (v) qs.set(k, v);
      else qs.delete(k);
    });
    const s = qs.toString();
    return s ? `/admin/appointments?${s}` : "/admin/appointments";
  }

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Appointments</h1>
      {!access.isSuperAdmin && access.assignedLocationLabel ? (
        <p className="mt-2 text-sm text-white/55">
          Showing bookings for <span className="text-glam-accent">{access.assignedLocationLabel}</span> only
        </p>
      ) : null}

      <AppointmentStats stats={stats} activeRange={rangeFilter} />

      <form action="/admin/appointments" className="mt-6 flex flex-wrap items-end gap-3">
        <input type="hidden" name="range" value={rangeFilter} />
        <input type="hidden" name="status" value={statusFilter} />
        <label className="text-xs text-white/65">
          Search client
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Name or phone"
            className="mt-1 block w-48 rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-xs text-white/65">
          From
          <input
            type="date"
            name="from"
            defaultValue={fromDate}
            className="mt-1 block rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-xs text-white/65">
          To
          <input
            type="date"
            name="to"
            defaultValue={toDate}
            className="mt-1 block rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
          />
        </label>
        <button type="submit" className={adminBtnOutline}>
          Apply
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <a key={tab} href={buildHref({ status: tab === "all" ? "" : tab })} className={adminTabClass(statusFilter === tab)}>
            {tab.replaceAll("_", " ")}
          </a>
        ))}
      </div>

      <div className="mt-6">
        <BookingsTable
          bookings={(data ?? []) as AdminBookingRow[]}
          updateBookingStatus={updateBookingStatusAction}
          staffOptions={(staffRows ?? []).map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>
    </AdminPanel>
  );
}
