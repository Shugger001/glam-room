import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  bookingLocationScope,
  locationLabelFromId,
  requireAdminAccess,
} from "@/lib/admin/access";
import {
  formatShiftDuration,
  loadStaffPresence,
  loadTodayShifts,
} from "@/lib/admin/staff-clock";
import { StaffClockStrip } from "@/components/admin/staff-clock-strip";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Attendance" };
export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }

  const access = await requireAdminAccess();
  const admin = createAdminClient();
  const locationScope = bookingLocationScope(access);

  const [members, todayShifts] = await Promise.all([
    loadStaffPresence(admin, locationScope),
    loadTodayShifts(admin, locationScope),
  ]);

  const onFloorCount = members.filter(
    (m) => m.openShift && (!locationScope || m.openShift.locationId === locationScope),
  ).length;

  return (
    <div className="w-full max-w-none space-y-6">
      <AdminPageHeader
        title="Staff attendance"
        description={
          access.isSuperAdmin
            ? "Front desk clocks the team in and out at each shop — Adenta, Sowutuom, and Madina."
            : `Front desk clock-in for ${access.assignedLocationLabel ?? "your shop"}.`
        }
      />

      <p className="text-sm text-white/55">
        {onFloorCount} on floor now · {todayShifts.length} shifts started today
      </p>

      <StaffClockStrip
        members={members}
        locationScope={locationScope}
        isSuperAdmin={access.isSuperAdmin}
        shopLabel={access.assignedLocationLabel}
      />

      <AdminSection
        title="Today's shifts"
        description="Clock-in history for today — open shifts stay until clocked out."
      >
        {todayShifts.length === 0 ? (
          <AdminEmptyState title="No clock-ins yet today." />
        ) : (
          <AdminPanel className="overflow-x-auto p-0 sm:p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[0.65rem] font-semibold uppercase tracking-wider text-white/45">
                <tr>
                  <th className="px-3 py-2.5 sm:px-4">Team</th>
                  <th className="px-3 py-2.5 sm:px-4">Shop</th>
                  <th className="px-3 py-2.5 sm:px-4">In</th>
                  <th className="px-3 py-2.5 sm:px-4">Out</th>
                  <th className="px-3 py-2.5 sm:px-4">Duration</th>
                </tr>
              </thead>
              <tbody>
                {todayShifts.map((shift) => {
                  const open = !shift.clock_out_at;
                  return (
                    <tr
                      key={shift.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-3 py-3 sm:px-4">
                        <p className="font-medium text-white">{shift.staff?.name ?? "—"}</p>
                        <p className="text-xs text-white/45">{shift.staff?.role ?? ""}</p>
                      </td>
                      <td className="px-3 py-3 text-white/70 sm:px-4">
                        {locationLabelFromId(shift.location_id) ?? shift.location_id}
                      </td>
                      <td className="px-3 py-3 text-white/70 sm:px-4">
                        {new Date(shift.clock_in_at).toLocaleTimeString([], {
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
