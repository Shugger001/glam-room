import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  bookingLocationScope,
  locationLabelFromId,
  requireAdminAccess,
} from "@/lib/admin/access";
import {
  formatMinutes,
  formatShiftDuration,
  loadStaffPresence,
  loadShiftsInRange,
  loadTodayShifts,
  loadWeekHours,
  toDateInputValue,
  weekBounds,
} from "@/lib/admin/staff-clock";
import { StaffClockStrip } from "@/components/admin/staff-clock-strip";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminSetupNotice,
  adminBtnOutline,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Attendance" };
export const dynamic = "force-dynamic";

type AttendancePageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

function isValidDateInput(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export default async function AdminAttendancePage({ searchParams }: AttendancePageProps) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }

  const access = await requireAdminAccess();
  const admin = createAdminClient();
  const locationScope = bookingLocationScope(access);
  const params = await searchParams;

  const { start: weekStart, end: weekEnd } = weekBounds();
  const defaultFrom = toDateInputValue(weekStart);
  const defaultTo = toDateInputValue(weekEnd);
  const fromDate = isValidDateInput(params.from) ? params.from! : defaultFrom;
  const toDate = isValidDateInput(params.to) ? params.to! : defaultTo;

  const today = toDateInputValue(new Date());

  const [members, todayShifts, weekHours, rangeShifts] = await Promise.all([
    loadStaffPresence(admin, locationScope),
    loadTodayShifts(admin, locationScope),
    loadWeekHours(admin, locationScope),
    loadShiftsInRange(admin, locationScope, fromDate, toDate),
  ]);

  const onFloorCount = members.filter(
    (m) => m.openShift && (!locationScope || m.openShift.locationId === locationScope),
  ).length;

  const weekLabel = `${new Date(weekHours.weekStart).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${new Date(weekHours.weekEnd).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;

  const showShopColumn = access.isSuperAdmin;
  const exportHref = `/api/admin/attendance/export?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`;

  return (
    <div className="w-full max-w-none space-y-6">
      <AdminPageHeader
        title="Staff attendance"
        description={
          access.isSuperAdmin
            ? "Front desk clocks the team in and out at each shop — Adenta, Sowutuom, and Madina."
            : `Front desk clock-in for ${access.assignedLocationLabel ?? "your shop"}.`
        }
        action={
          <a href={exportHref} className={cn(adminBtnOutline, "text-xs")}>
            Export CSV
          </a>
        }
      />

      <p className="text-sm text-white/55">
        {onFloorCount} on floor now · {todayShifts.length} shifts on today&apos;s board
      </p>

      <StaffClockStrip
        members={members}
        locationScope={locationScope}
        isSuperAdmin={access.isSuperAdmin}
        shopLabel={access.assignedLocationLabel}
      />

      <AdminSection
        title="This week’s hours"
        description={`${weekLabel}${locationScope ? ` · ${access.assignedLocationLabel}` : " · all shops"}`}
      >
        {weekHours.rows.length === 0 ? (
          <AdminEmptyState title="No clock-ins this week yet." />
        ) : (
          <AdminPanel className="overflow-x-auto p-0 sm:p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[0.65rem] font-semibold uppercase tracking-wider text-white/45">
                <tr>
                  <th className="px-3 py-2.5 sm:px-4">Team</th>
                  <th className="px-3 py-2.5 sm:px-4">Shifts</th>
                  <th className="px-3 py-2.5 sm:px-4">Hours</th>
                  <th className="px-3 py-2.5 sm:px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {weekHours.rows.map((row) => (
                  <tr key={row.staffId} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-3 sm:px-4">
                      <p className="font-medium text-white">{row.name}</p>
                      <p className="text-xs text-white/45">{row.role}</p>
                    </td>
                    <td className="px-3 py-3 text-white/70 sm:px-4">{row.shiftCount}</td>
                    <td className="px-3 py-3 font-medium text-white sm:px-4">
                      {formatMinutes(row.totalMinutes)}
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      {row.openCount > 0 ? (
                        <span className="text-emerald-300">On floor</span>
                      ) : (
                        <span className="text-white/45">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminPanel>
        )}
      </AdminSection>

      <AdminSection
        title="Timesheet"
        description="Filter by date range for payroll. Open overnight shifts appear on Today’s board too."
      >
        <form
          method="get"
          className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3"
        >
          <label className="text-xs text-white/55">
            From
            <input
              type="date"
              name="from"
              defaultValue={fromDate}
              className="mt-1 block rounded-md border border-white/15 bg-transparent px-2.5 py-1.5 text-sm text-white"
            />
          </label>
          <label className="text-xs text-white/55">
            To
            <input
              type="date"
              name="to"
              defaultValue={toDate}
              className="mt-1 block rounded-md border border-white/15 bg-transparent px-2.5 py-1.5 text-sm text-white"
            />
          </label>
          <button type="submit" className={cn(adminBtnOutline, "min-h-10 text-xs")}>
            Apply
          </button>
          <a
            href={`/admin/attendance?from=${defaultFrom}&to=${defaultTo}`}
            className="text-xs font-semibold uppercase tracking-wider text-glam-accent hover:text-white"
          >
            This week
          </a>
          <a
            href={`/admin/attendance?from=${today}&to=${today}`}
            className="text-xs font-semibold uppercase tracking-wider text-glam-accent hover:text-white"
          >
            Today
          </a>
          <a
            href={exportHref}
            className="text-xs font-semibold uppercase tracking-wider text-white/55 hover:text-white"
          >
            Download CSV
          </a>
        </form>

        {rangeShifts.length === 0 ? (
          <AdminEmptyState title="No shifts in this date range." />
        ) : (
          <AdminPanel className="overflow-x-auto p-0 sm:p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[0.65rem] font-semibold uppercase tracking-wider text-white/45">
                <tr>
                  <th className="px-3 py-2.5 sm:px-4">Team</th>
                  {showShopColumn ? <th className="px-3 py-2.5 sm:px-4">Shop</th> : null}
                  <th className="px-3 py-2.5 sm:px-4">In</th>
                  <th className="px-3 py-2.5 sm:px-4">Out</th>
                  <th className="px-3 py-2.5 sm:px-4">Duration</th>
                  <th className="px-3 py-2.5 sm:px-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rangeShifts.map((shift) => {
                  const open = !shift.clock_out_at;
                  return (
                    <tr key={shift.id} className="border-b border-white/5 last:border-0">
                      <td className="px-3 py-3 sm:px-4">
                        <p className="font-medium text-white">{shift.staff?.name ?? "—"}</p>
                        <p className="text-xs text-white/45">{shift.staff?.role ?? ""}</p>
                      </td>
                      {showShopColumn ? (
                        <td className="px-3 py-3 text-white/70 sm:px-4">
                          {locationLabelFromId(shift.location_id) ?? shift.location_id}
                        </td>
                      ) : null}
                      <td className="px-3 py-3 text-white/70 sm:px-4">
                        {new Date(shift.clock_in_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        {open ? (
                          <span className="text-emerald-300">On floor</span>
                        ) : (
                          <span className="text-white/70">
                            {new Date(shift.clock_out_at!).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-white/70 sm:px-4">
                        {formatShiftDuration(shift.clock_in_at, shift.clock_out_at)}
                      </td>
                      <td className="max-w-[12rem] truncate px-3 py-3 text-white/55 sm:px-4">
                        {shift.notes?.trim() || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </AdminPanel>
        )}
      </AdminSection>

      <AdminSection
        title="Today's board"
        description="Includes overnight open shifts still on the floor."
      >
        {todayShifts.length === 0 ? (
          <AdminEmptyState title="No clock-ins yet today." />
        ) : (
          <AdminPanel className="overflow-x-auto p-0 sm:p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[0.65rem] font-semibold uppercase tracking-wider text-white/45">
                <tr>
                  <th className="px-3 py-2.5 sm:px-4">Team</th>
                  {showShopColumn ? <th className="px-3 py-2.5 sm:px-4">Shop</th> : null}
                  <th className="px-3 py-2.5 sm:px-4">In</th>
                  <th className="px-3 py-2.5 sm:px-4">Out</th>
                  <th className="px-3 py-2.5 sm:px-4">Duration</th>
                </tr>
              </thead>
              <tbody>
                {todayShifts.map((shift) => {
                  const open = !shift.clock_out_at;
                  const overnight =
                    open && new Date(shift.clock_in_at) < new Date(new Date().setHours(0, 0, 0, 0));
                  return (
                    <tr key={shift.id} className="border-b border-white/5 last:border-0">
                      <td className="px-3 py-3 sm:px-4">
                        <p className="font-medium text-white">{shift.staff?.name ?? "—"}</p>
                        <p className="text-xs text-white/45">
                          {shift.staff?.role ?? ""}
                          {overnight ? " · overnight" : ""}
                        </p>
                      </td>
                      {showShopColumn ? (
                        <td className="px-3 py-3 text-white/70 sm:px-4">
                          {locationLabelFromId(shift.location_id) ?? shift.location_id}
                        </td>
                      ) : null}
                      <td className="px-3 py-3 text-white/70 sm:px-4">
                        {new Date(shift.clock_in_at).toLocaleString([], {
                          month: overnight ? "short" : undefined,
                          day: overnight ? "numeric" : undefined,
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        {open ? (
                          <span className="text-emerald-300">On floor</span>
                        ) : (
                          <span className="text-white/70">
                            {new Date(shift.clock_out_at!).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-white/70 sm:px-4">
                        {formatShiftDuration(shift.clock_in_at, shift.clock_out_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </AdminPanel>
        )}
      </AdminSection>
    </div>
  );
}
