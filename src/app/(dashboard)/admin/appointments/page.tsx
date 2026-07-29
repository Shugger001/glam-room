import { createAdminClient } from "@/lib/supabase/admin";
import {
  bookingLocationScope,
  requireAdminAccess,
} from "@/lib/admin/access";
import { createWalkInBookingAction } from "@/lib/admin/walk-in-booking-action";
import { WalkInBookingForm } from "@/components/admin/walk-in-booking-form";
import { SALON_SERVICES, isServiceCategory, type SalonService } from "@/lib/constants/services";

function mapServicesFromRows(
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
import { updateBookingStatusAction } from "@/lib/admin/update-booking-status";
import { markDepositPaidAction } from "@/lib/admin/mark-deposit-paid";
import { loadShopCapacityToday } from "@/lib/admin/load-shop-capacity";
import { enrichBookingsWithCrm } from "@/lib/admin/enrich-bookings-crm";
import { BookingsByTimeGroups, type AdminBookingRow } from "@/components/admin/bookings-table";
import { AppointmentStats } from "@/components/admin/appointment-stats";
import { BulkApproveBar } from "@/components/admin/bulk-approve-bar";
import { BulkChaseDepositsBar, type ChaseDepositTarget } from "@/components/admin/bulk-chase-deposits-bar";
import { ShopCapacityStrip } from "@/components/admin/shop-capacity-strip";
import {
  adminBtnOutline,
  AdminChipStrip,
  AdminFilterBar,
  AdminPageHeader,
  AdminPanel,
  adminTabClass,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

const statusTabs = [
  "all",
  "pending",
  "awaiting_approval",
  "confirmed",
  "arrived",
  "rejected",
  "cancelled",
  "completed",
  "no_show",
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
  const staffLocationScope = bookingLocationScope(access);

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
  const depositParam = typeof params.deposit === "string" ? params.deposit : "all";
  const depositFilter =
    depositParam === "paid" || depositParam === "unpaid" ? depositParam : "all";
  const staffParam = typeof params.staff === "string" ? params.staff : "all";
  const locationParam = typeof params.location === "string" ? params.location : "all";
  const pageSize = 40;
  const pageRaw = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;
  const walkinOpen =
    params.walkin === "1" || params.walkin === "true" || Boolean(params.name) || Boolean(params.phone);
  const walkinName = typeof params.name === "string" ? params.name.trim() : "";
  const walkinPhone = typeof params.phone === "string" ? params.phone.trim() : "";
  const walkinShop =
    typeof params.shop === "string" && SALON_LOCATIONS.some((l) => l.id === params.shop)
      ? params.shop
      : "";
  const locationFilter =
    access.isSuperAdmin && SALON_LOCATIONS.some((l) => l.id === locationParam)
      ? locationParam
      : "all";
  const locationScope = staffLocationScope ?? (locationFilter === "all" ? null : locationFilter);

  const admin = createAdminClient();

  const bookingSelect =
    "id, start_at, status, location_type, location_id, staff_id, client_name, client_phone, client_notes, admin_notes, deposit_paid, deposit_amount, paystack_reference, promotion_code, profiles(full_name,phone,crm_tags,admin_notes), services(name), staff(name)";

  let query = admin
    .from("bookings")
    .select(bookingSelect, { count: "exact" })
    .order("start_at", { ascending: true });
  if (locationScope) query = query.eq("location_id", locationScope);
  if (statusFilter !== "all") query = query.eq("status", statusFilter);
  if (staffParam !== "all") query = query.eq("staff_id", staffParam);
  if (depositFilter === "paid") query = query.eq("deposit_paid", true);
  if (depositFilter === "unpaid") {
    query = query.eq("deposit_paid", false).gt("deposit_amount", 0);
  }
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

  const [{ data, count }, { data: staffRows }, statsRes, { data: serviceRows }, capacityRows, paidAwaitingRes] =
    await Promise.all([
    query.range(rangeFrom, rangeTo),
    admin.from("staff").select("id, name").eq("active", true).eq("is_front_desk", false).order("sort_order"),
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
    admin
      .from("services")
      .select("id, name, description, duration_minutes, base_price, category, slug, image_url, featured, active, sort_order, location_ids")
      .eq("active", true)
      .order("sort_order"),
    loadShopCapacityToday(admin, locationScope),
    (async () => {
      let paidQuery = admin
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "awaiting_approval"])
        .eq("deposit_paid", true);
      if (locationScope) paidQuery = paidQuery.eq("location_id", locationScope);
      return paidQuery;
    })(),
  ]);

  const bookings = await enrichBookingsWithCrm(admin, (data ?? []) as AdminBookingRow[]);
  const total = count ?? bookings.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showingFrom = total === 0 ? 0 : rangeFrom + 1;
  const showingTo = Math.min(rangeTo + 1, total);

  const services = mapServicesFromRows(serviceRows);

  const chaseTargets: ChaseDepositTarget[] = bookings
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
      href: "/admin/appointments?range=today&deposit=unpaid",
    },
  ];

  function buildHref(next: Record<string, string>) {
    const qs = new URLSearchParams();
    if (statusFilter !== "all") qs.set("status", statusFilter);
    if (rangeFilter !== "today") qs.set("range", rangeFilter);
    if (fromDate) qs.set("from", fromDate);
    if (toDate) qs.set("to", toDate);
    if (q) qs.set("q", q);
    if (depositFilter !== "all") qs.set("deposit", depositFilter);
    if (staffParam !== "all") qs.set("staff", staffParam);
    if (locationFilter !== "all") qs.set("location", locationFilter);
    if (page > 1) qs.set("page", String(page));
    Object.entries(next).forEach(([k, v]) => {
      if (v) qs.set(k, v);
      else qs.delete(k);
    });
    // Reset to page 1 when filters change (unless page is explicitly set)
    if (!("page" in next) && Object.keys(next).some((k) => k !== "page")) {
      qs.delete("page");
    }
    const s = qs.toString();
    return s ? `/admin/appointments?${s}` : "/admin/appointments";
  }

  const hasActiveFilters =
    statusFilter !== "all" ||
    rangeFilter !== "today" ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    Boolean(q) ||
    depositFilter !== "all" ||
    staffParam !== "all" ||
    locationFilter !== "all";

  const paidAwaitingCount = paidAwaitingRes.count ?? 0;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Appointments"
        description={
          !access.isSuperAdmin && access.assignedLocationLabel
            ? `Showing bookings for ${access.assignedLocationLabel} only`
            : "Search, filter, and run the floor across shops."
        }
      />

      <AppointmentStats stats={stats} activeRange={rangeFilter} />

      <div className="space-y-3">
        <ShopCapacityStrip shops={capacityRows} />
        <BulkApproveBar paidAwaitingCount={paidAwaitingCount} locationId={locationScope} />
        <BulkChaseDepositsBar targets={chaseTargets} />
      </div>

      <WalkInBookingForm
        services={services}
        staff={(staffRows ?? []).map((s) => ({ id: s.id, name: s.name }))}
        defaultLocationId={locationScope}
        defaults={{
          open: walkinOpen,
          clientName: walkinName,
          clientPhone: walkinPhone,
          locationId: walkinShop || locationScope,
        }}
        createWalkInBooking={createWalkInBookingAction}
      />

      <AdminPanel>
      <form action="/admin/appointments">
        <AdminFilterBar>
        <input type="hidden" name="range" value={rangeFilter} />
        <input type="hidden" name="status" value={statusFilter} />
        {depositFilter !== "all" ? <input type="hidden" name="deposit" value={depositFilter} /> : null}
        {staffParam !== "all" ? <input type="hidden" name="staff" value={staffParam} /> : null}
        {locationFilter !== "all" ? <input type="hidden" name="location" value={locationFilter} /> : null}
        <label className="text-xs text-white/65">
          Search
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Name or phone"
            className="mt-1 block w-56 rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white sm:w-72"
          />
        </label>
        <label className="text-xs text-white/65">
          From
          <input
            type="date"
            name="from"
            defaultValue={fromDate}
            className="mt-1 block rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-xs text-white/65">
          To
          <input
            type="date"
            name="to"
            defaultValue={toDate}
            className="mt-1 block rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
          />
        </label>
        <button type="submit" className={adminBtnOutline}>
          Apply
        </button>
        {hasActiveFilters ? (
          <a href="/admin/appointments" className="text-xs font-semibold uppercase tracking-wider text-glam-accent hover:text-white">
            Clear all
          </a>
        ) : null}
        </AdminFilterBar>
      </form>

      <div className="mt-3 space-y-2.5">
      <AdminChipStrip label="Range">
        {(
          [
            ["today", "Today"],
            ["week", "This week"],
            ["all", "All"],
          ] as const
        ).map(([value, label]) => (
          <a
            key={value}
            href={buildHref({ range: value === "today" ? "" : value, from: "", to: "" })}
            className={cn(adminTabClass(rangeFilter === value && !fromDate && !toDate), "shrink-0")}
          >
            {label}
          </a>
        ))}
      </AdminChipStrip>

      <AdminChipStrip label="Deposit">
        {(
          [
            ["all", "All"],
            ["unpaid", "Unpaid"],
            ["paid", "Paid"],
          ] as const
        ).map(([value, label]) => (
          <a
            key={value}
            href={buildHref({ deposit: value === "all" ? "" : value })}
            className={cn(adminTabClass(depositFilter === value), "shrink-0")}
          >
            {label}
          </a>
        ))}
      </AdminChipStrip>

      {access.isSuperAdmin ? (
        <AdminChipStrip label="Shop">
          <a href={buildHref({ location: "" })} className={cn(adminTabClass(locationFilter === "all"), "shrink-0")}>
            All shops
          </a>
          {SALON_LOCATIONS.map((loc) => (
            <a
              key={loc.id}
              href={buildHref({ location: loc.id })}
              className={cn(adminTabClass(locationFilter === loc.id), "shrink-0")}
            >
              {loc.area}
            </a>
          ))}
        </AdminChipStrip>
      ) : null}

      <AdminChipStrip>
        {statusTabs.map((tab) => (
          <a
            key={tab}
            href={buildHref({ status: tab === "all" ? "" : tab })}
            className={cn(adminTabClass(statusFilter === tab), "shrink-0")}
          >
            {tab.replaceAll("_", " ")}
          </a>
        ))}
      </AdminChipStrip>

      {(staffRows ?? []).length > 0 ? (
        <AdminChipStrip label="Stylist">
          <a href={buildHref({ staff: "" })} className={cn(adminTabClass(staffParam === "all"), "shrink-0")}>
            All
          </a>
          {(staffRows ?? []).map((s) => (
            <a
              key={s.id}
              href={buildHref({ staff: s.id })}
              className={cn(adminTabClass(staffParam === s.id), "shrink-0")}
            >
              {s.name}
            </a>
          ))}
        </AdminChipStrip>
      ) : null}
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs tabular-nums text-white/45">
          Showing {showingFrom}–{showingTo} of {total}
          {q ? ` matching “${q}”` : ""}
          {depositFilter !== "all" ? ` · deposit ${depositFilter}` : ""}
        </p>
        <BookingsByTimeGroups
          bookings={bookings}
          updateBookingStatus={updateBookingStatusAction}
          markDepositPaid={markDepositPaidAction}
          staffOptions={(staffRows ?? []).map((s) => ({ id: s.id, name: s.name }))}
        />
        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/60">
            <p className="tabular-nums">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <a
                href={buildHref({ page: page > 1 ? String(page - 1) : "" })}
                className={adminBtnOutline}
                aria-disabled={page <= 1}
              >
                Prev
              </a>
              <a
                href={buildHref({
                  page: page < totalPages ? String(page + 1) : String(totalPages),
                })}
                className={adminBtnOutline}
              >
                Next
              </a>
            </div>
          </div>
        ) : null}
      </div>
      </AdminPanel>
    </div>
  );
}
