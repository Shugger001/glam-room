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

export function formatShiftDuration(clockInAt: string, clockOutAt?: string | null) {
  const start = new Date(clockInAt).getTime();
  const end = clockOutAt ? new Date(clockOutAt).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "—";
  const mins = Math.floor((end - start) / 60_000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export async function loadStaffPresence(
  admin: ReturnType<typeof createAdminClient>,
  locationScope: string | null = null,
): Promise<StaffPresenceMember[]> {
  if (locationScope) {
    // Shop-scoped: only fetch staff belonging to this shop (home match or floater)
    // and only open shifts at this shop.
    const [{ data: staffRows }, { data: openShifts }] = await Promise.all([
      admin
        .from("staff")
        .select("id, name, role, is_front_desk, home_location_id")
        .eq("active", true)
        .or(`home_location_id.eq.${locationScope},home_location_id.is.null`)
        .order("sort_order"),
      admin
        .from("staff_shifts")
        .select("id, staff_id, location_id, clock_in_at")
        .is("clock_out_at", null)
        .eq("location_id", locationScope),
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

  // Super admin: full roster + all open shifts across shops.
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

export async function loadTodayShifts(
  admin: ReturnType<typeof createAdminClient>,
  locationScope: string | null,
): Promise<StaffShiftRow[]> {
  const { start, end } = dayBounds();
  let q = admin
    .from("staff_shifts")
    .select("id, staff_id, location_id, clock_in_at, clock_out_at, notes, staff(id, name, role)")
    .gte("clock_in_at", start.toISOString())
    .lte("clock_in_at", end.toISOString())
    .order("clock_in_at", { ascending: false });
  if (locationScope) q = q.eq("location_id", locationScope);
  const { data } = await q;
  return (data ?? []) as unknown as StaffShiftRow[];
}

export async function clockInStaffAction(formData: FormData) {
  "use server";

  const access = await requireAdminAccess();
  const staffId = String(formData.get("staff_id") ?? "").trim();
  const locationRaw = String(formData.get("location_id") ?? "").trim();

  if (!staffId) {
    return redirectBackWithFlash("error", "Pick a team member to clock in.", "/admin/attendance");
  }

  const locationId = access.isSuperAdmin
    ? locationRaw
    : access.assignedLocationId ?? "";

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

  const { error } = await admin
    .from("staff_shifts")
    .update({
      clock_out_at: new Date().toISOString(),
      clocked_out_by: access.userId,
    })
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
