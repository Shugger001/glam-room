import { redirect } from "next/navigation";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { ADMIN_NAV } from "@/lib/constants/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/types/database";

export type AdminAccess = {
  userId: string;
  role: ProfileRole;
  /** Full access — all shops, CRM, settings */
  isSuperAdmin: boolean;
  assignedLocationId: string | null;
  assignedLocationLabel: string | null;
};

export const STAFF_ADMIN_NAV = [{ href: "/admin/appointments", label: "Appointments" }] as const;

export function locationLabelFromId(locationId: string | null) {
  if (!locationId) return null;
  return SALON_LOCATIONS.find((l) => l.id === locationId)?.area ?? locationId;
}

export function getAdminNav(isSuperAdmin: boolean) {
  return isSuperAdmin ? ADMIN_NAV : STAFF_ADMIN_NAV;
}

/** Location filter for booking queries — null means all shops (super admin). */
export function bookingLocationScope(access: AdminAccess): string | null {
  return access.isSuperAdmin ? null : access.assignedLocationId;
}

export async function getAdminAccess(): Promise<AdminAccess | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, assigned_location_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) return null;

  const assignedLocationId = profile.assigned_location_id ?? null;

  return {
    userId: user.id,
    role: profile.role as ProfileRole,
    isSuperAdmin: profile.role === "admin",
    assignedLocationId,
    assignedLocationLabel: locationLabelFromId(assignedLocationId),
  };
}

export async function requireAdminAccess(): Promise<AdminAccess> {
  const access = await getAdminAccess();
  if (!access) redirect("/auth?next=/admin");
  return access;
}

export async function requireSuperAdmin(): Promise<AdminAccess> {
  const access = await requireAdminAccess();
  if (!access.isSuperAdmin) redirect("/admin/appointments");
  return access;
}

export async function requireStaffBookingAccess(bookingId: string): Promise<AdminAccess> {
  const access = await requireAdminAccess();
  if (access.isSuperAdmin) return access;

  if (!access.assignedLocationId) {
    redirect("/admin/appointments");
  }

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("location_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking || booking.location_id !== access.assignedLocationId) {
    redirect("/admin/appointments");
  }

  return access;
}
