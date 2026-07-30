import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminAccess, locationLabelFromId } from "@/lib/admin/access";
import { redirectBackWithFlash } from "@/lib/admin/flash-redirect";
import { SALON_LOCATIONS } from "@/lib/constants/locations";

export type StaffShiftRow = {
  id: string;
  staff_id: string;
  location_id: string;
  clock_in_at: string;
  clock_out_at: string | null;
  notes: string | null;
  clocked_in_by?: string | null;
  clocked_out_by?: string | null;
  staff: { id: string; name: string; role: string } | null;
};

export type StaffPresenceMember = {
  staffId: string;
  name: string;
  role: string;
  isFrontDesk: boolean;
  homeLocationId: string | null;
  openShift: {
    id: string;
    locationId: string;
    locationLabel: string;
    clockInAt: string;
  } | null;
};

function revalidateAttendancePaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/attendance");
}

function validLocationId(locationId: string) {
  return SALON_LOCATIONS.some((l) => l.id === locationId);
}

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** Monday 00:00 → Sunday 23:59:59.999 (local). */
export function weekBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay(); // 0 Sun … 6 Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateInput(value: string, endOfDay = false) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  else date.setHours(0, 0, 0, 0);
  return date;
}

function shiftMinutes(clockInAt: string, clockOutAt?: string | null, nowMs = Date.now()) {
  const start = new Date(clockInAt).getTime();
  const end = clockOutAt ? new Date(clockOutAt).getTime() : nowMs;
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.floor((end - start) / 60_000);
}

export function formatShiftDuration(clockInAt: string, clockOutAt?: string | null, nowMs?: number) {
  return formatMinutes(shiftMinutes(clockInAt, clockOutAt, nowMs ?? Date.now()));
}

export function formatMinutes(mins: number) {
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export type StaffWeekHoursRow = {
  staffId: string;
  name: string;
  role: string;
  shiftCount: number;
  openCount: number;
  totalMinutes: number;
};

function mapStaffJoin(staffJoin: unknown): { id: string; name: string; role: string } | null {
  if (staffJoin && typeof staffJoin === "object" && !Array.isArray(staffJoin)) {
    return staffJoin as { id: string; name: string; role: string };
  }
  if (Array.isArray(staffJoin) && staffJoin[0]) {
    return staffJoin[0] as { id: string; name: string; role: string };
  }
  return null;
}

/**
 * Staff IDs with an open shift at a given shop (or any shop when locationId is null).
 */
export function clockedInStaffIdsAtLocation(
  members: StaffPresenceMember[],
  locationId: string | null,
) {
  const ids = new Set<string>();
  for (const member of members) {
    if (!member.openShift) continue;
    if (!locationId || member.openShift.locationId === locationId) {
      ids.add(member.staffId);
    }
  }
  return ids;
}

/** staffId → locationId for everyone currently clocked in. */
export function clockedInAtMapFromPresence(members: StaffPresenceMember[]) {
  const map: Record<string, string> = {};
  for (const member of members) {
    if (member.openShift) map[member.staffId] = member.openShift.locationId;
  }
  return map;
}

/**
 * Aggregate clocked hours for the current local week, scoped to a shop when provided.
 */
export async function loadWeekHours(
  admin: ReturnType<typeof createAdminClient>,
  locationScope: string | null,
): Promise<{ weekStart: string; weekEnd: string; rows: StaffWeekHoursRow[] }> {
  const { start, end } = weekBounds();
  let q = admin
    .from("staff_shifts")
    .select("staff_id, clock_in_at, clock_out_at, staff(id, name, role)")
    .gte("clock_in_at", start.toISOString())
    .lte("clock_in_at", end.toISOString());
  if (locationScope) q = q.eq("location_id", locationScope);

  const { data } = await q;
  const byStaff = new Map<string, StaffWeekHoursRow>();

  for (const shift of data ?? []) {
    const staffId = shift.staff_id as string;
    const staff = mapStaffJoin(shift.staff);
    const existing = byStaff.get(staffId) ?? {
      staffId,
      name: staff?.name ?? "—",
      role: staff?.role ?? "",
      shiftCount: 0,
      openCount: 0,
      totalMinutes: 0,
    };
    existing.shiftCount += 1;
    if (!shift.clock_out_at) existing.openCount += 1;
    existing.totalMinutes += shiftMinutes(
      shift.clock_in_at as string,
      shift.clock_out_at as string | null,
    );
    byStaff.set(staffId, existing);
  }

  const rows = [...byStaff.values()].sort((a, b) => b.totalMinutes - a.totalMinutes);
  return {
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
    rows,
  };
}

export async function loadStaffPresence(
  admin: ReturnType<typeof createAdminClient>,
  locationScope: string | null = null,
): Promise<StaffPresenceMember[]> {
  if (locationScope) {
    const { data: staffRows } = await admin
      .from("staff")
      .select("id, name, role, is_front_desk, home_location_id")
      .eq("active", true)
      .or(`home_location_id.eq.${locationScope},home_location_id.is.null`)
      .order("sort_order");

    const staffIds = (staffRows ?? []).map((row) => row.id as string);
    let openShifts: Array<{
      id: string;
      staff_id: string;
      location_id: string;
      clock_in_at: string;
    }> = [];

    if (staffIds.length > 0) {
      // Include open shifts at this shop and elsewhere so front desk sees “already in at X”
      const { data } = await admin
        .from("staff_shifts")
        .select("id, staff_id, location_id, clock_in_at")
        .is("clock_out_at", null)
        .in("staff_id", staffIds);
      openShifts = (data ?? []) as typeof openShifts;
    }

    const openByStaff = new Map(
      openShifts.map((s) => [
        s.staff_id,
        {
          id: s.id,
          locationId: s.location_id,
          locationLabel: locationLabelFromId(s.location_id) ?? s.location_id,
          clockInAt: s.clock_in_at,
        },
      ]),
    );

    return (staffRows ?? [])
      .map((row) => ({
        staffId: row.id,
        name: row.name,
        role: row.role,
        isFrontDesk: row.is_front_desk === true,
        homeLocationId: (row.home_location_id as string | null) ?? null,
        openShift: openByStaff.get(row.id) ?? null,
      }))
      .sort((a, b) => {
        if (a.isFrontDesk !== b.isFrontDesk) return a.isFrontDesk ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }

  const [{ data: staffRows }, { data: openShifts }] = await Promise.all([
    admin
      .from("staff")
      .select("id, name, role, is_front_desk, home_location_id")
      .eq("active", true)
      .order("sort_order"),
    admin.from("staff_shifts").select("id, staff_id, location_id, clock_in_at").is("clock_out_at", null),
  ]);

  const openByStaff = new Map(
    (openShifts ?? []).map((s) => [
      s.staff_id as string,
      {
        id: s.id as string,
        locationId: s.location_id as string,
        locationLabel: locationLabelFromId(s.location_id as string) ?? (s.location_id as string),
        clockInAt: s.clock_in_at as string,
      },
    ]),
  );

  return (staffRows ?? [])
    .map((row) => ({
      staffId: row.id,
      name: row.name,
      role: row.role,
      isFrontDesk: row.is_front_desk === true,
      homeLocationId: (row.home_location_id as string | null) ?? null,
      openShift: openByStaff.get(row.id) ?? null,
    }))
    .sort((a, b) => {
      if (a.isFrontDesk !== b.isFrontDesk) return a.isFrontDesk ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Shifts that started today, plus overnight open shifts still on the floor.
 */
export async function loadTodayShifts(
  admin: ReturnType<typeof createAdminClient>,
  locationScope: string | null,
): Promise<StaffShiftRow[]> {
  const { start, end } = dayBounds();
  const selectCols =
    "id, staff_id, location_id, clock_in_at, clock_out_at, notes, clocked_in_by, clocked_out_by, staff(id, name, role)";

  let todayQuery = admin
    .from("staff_shifts")
    .select(selectCols)
    .gte("clock_in_at", start.toISOString())
    .lte("clock_in_at", end.toISOString())
    .order("clock_in_at", { ascending: false });
  if (locationScope) todayQuery = todayQuery.eq("location_id", locationScope);

  let overnightQuery = admin
    .from("staff_shifts")
    .select(selectCols)
    .is("clock_out_at", null)
    .lt("clock_in_at", start.toISOString())
    .order("clock_in_at", { ascending: false });
  if (locationScope) overnightQuery = overnightQuery.eq("location_id", locationScope);

  const [{ data: today }, { data: overnight }] = await Promise.all([todayQuery, overnightQuery]);
  const byId = new Map<string, StaffShiftRow>();
  for (const row of [...(overnight ?? []), ...(today ?? [])]) {
    byId.set(row.id as string, row as unknown as StaffShiftRow);
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.clock_in_at).getTime() - new Date(a.clock_in_at).getTime(),
  );
}

/**
 * Payroll timesheet rows for an inclusive local date range (by clock_in_at).
 */
export async function loadShiftsInRange(
  admin: ReturnType<typeof createAdminClient>,
  locationScope: string | null,
  fromDate: string,
  toDate: string,
): Promise<StaffShiftRow[]> {
  const from = parseDateInput(fromDate, false);
  const to = parseDateInput(toDate, true);
  if (!from || !to || from > to) return [];

  let q = admin
    .from("staff_shifts")
    .select(
      "id, staff_id, location_id, clock_in_at, clock_out_at, notes, clocked_in_by, clocked_out_by, staff(id, name, role)",
    )
    .gte("clock_in_at", from.toISOString())
    .lte("clock_in_at", to.toISOString())
    .order("clock_in_at", { ascending: false });
  if (locationScope) q = q.eq("location_id", locationScope);

  const { data } = await q;
  return (data ?? []) as unknown as StaffShiftRow[];
}

export function shiftsToCsv(rows: StaffShiftRow[]) {
  const header = ["staff", "role", "shop", "clock_in", "clock_out", "minutes", "notes"];
  const lines = [header.join(",")];
  for (const row of rows) {
    const minutes = shiftMinutes(row.clock_in_at, row.clock_out_at);
    const cells = [
      row.staff?.name ?? "",
      row.staff?.role ?? "",
      locationLabelFromId(row.location_id) ?? row.location_id,
      row.clock_in_at,
      row.clock_out_at ?? "",
      String(minutes),
      row.notes ?? "",
    ].map((value) => {
      const raw = String(value);
      if (/[",\n]/.test(raw)) return `"${raw.replaceAll('"', '""')}"`;
      return raw;
    });
    lines.push(cells.join(","));
  }
  return `${lines.join("\n")}\n`;
}

export async function clockInStaffAction(formData: FormData) {
  "use server";

  const access = await requireAdminAccess();
  const staffId = String(formData.get("staff_id") ?? "").trim();
  const locationRaw = String(formData.get("location_id") ?? "").trim();

  if (!staffId) {
    return redirectBackWithFlash("error", "Pick a team member to clock in.", "/admin/attendance");
  }

  const locationId = access.isSuperAdmin ? locationRaw : access.assignedLocationId ?? "";

  if (!locationId || !validLocationId(locationId)) {
    return redirectBackWithFlash(
      "error",
      access.isSuperAdmin
        ? "Pick a shop before clocking in."
        : "Your account needs a shop assignment before clock-in.",
      "/admin/attendance",
    );
  }

  const admin = createAdminClient();
  const { data: staffRow } = await admin
    .from("staff")
    .select("id, active, name")
    .eq("id", staffId)
    .maybeSingle();

  if (!staffRow || staffRow.active === false) {
    return redirectBackWithFlash("error", "That team member is not available.", "/admin/attendance");
  }

  const { data: openShift } = await admin
    .from("staff_shifts")
    .select("id, location_id")
    .eq("staff_id", staffId)
    .is("clock_out_at", null)
    .maybeSingle();

  if (openShift) {
    const shop = locationLabelFromId(openShift.location_id) ?? openShift.location_id;
    return redirectBackWithFlash(
      "error",
      `${staffRow.name} is already clocked in at ${shop}.`,
      "/admin/attendance",
    );
  }

  const { error } = await admin.from("staff_shifts").insert({
    staff_id: staffId,
    location_id: locationId,
    clocked_in_by: access.userId,
  });

  if (error) {
    return redirectBackWithFlash("error", "Could not clock in. Try again.", "/admin/attendance");
  }

  revalidateAttendancePaths();
  return redirectBackWithFlash(
    "success",
    `${staffRow.name} clocked in · ${locationLabelFromId(locationId)}`,
    "/admin/attendance",
  );
}

export async function clockOutStaffAction(formData: FormData) {
  "use server";

  const access = await requireAdminAccess();
  const shiftId = String(formData.get("shift_id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 240);
  if (!shiftId) {
    return redirectBackWithFlash("error", "Missing shift to clock out.", "/admin/attendance");
  }

  const admin = createAdminClient();
  const { data: shift } = await admin
    .from("staff_shifts")
    .select("id, location_id, clock_out_at, staff(name)")
    .eq("id", shiftId)
    .maybeSingle();

  if (!shift || shift.clock_out_at) {
    return redirectBackWithFlash("error", "That shift is already closed.", "/admin/attendance");
  }

  if (!access.isSuperAdmin) {
    if (!access.assignedLocationId || shift.location_id !== access.assignedLocationId) {
      return redirectBackWithFlash(
        "error",
        "You can only clock out staff at your shop.",
        "/admin/attendance",
      );
    }
  }

  const updatePayload: Record<string, unknown> = {
    clock_out_at: new Date().toISOString(),
    clocked_out_by: access.userId,
  };
  if (notes.length > 0) updatePayload.notes = notes;

  const { error } = await admin
    .from("staff_shifts")
    .update(updatePayload)
    .eq("id", shiftId)
    .is("clock_out_at", null);

  if (error) {
    return redirectBackWithFlash("error", "Could not clock out. Try again.", "/admin/attendance");
  }

  const staffName =
    shift.staff && typeof shift.staff === "object" && "name" in shift.staff
      ? String((shift.staff as { name: string }).name)
      : "Staff";

  revalidateAttendancePaths();
  return redirectBackWithFlash("success", `${staffName} clocked out`, "/admin/attendance");
}
