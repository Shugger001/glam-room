import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { ADMIN_NAV_GROUPS, STAFF_ADMIN_NAV_GROUPS } from "@/lib/constants/navigation";
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

export const STAFF_ADMIN_NAV = STAFF_ADMIN_NAV_GROUPS.flatMap((g) => g.items);

export function getAdminNavGroups(isSuperAdmin: boolean) {
  return isSuperAdmin ? ADMIN_NAV_GROUPS : STAFF_ADMIN_NAV_GROUPS;
}

export function getAdminNav(isSuperAdmin: boolean) {
  return getAdminNavGroups(isSuperAdmin).flatMap((g) => g.items);
}

export function locationLabelFromId(locationId: string | null) {
  if (!locationId) return null;
  return SALON_LOCATIONS.find((l) => l.id === locationId)?.area ?? locationId;
}

/** Location filter for booking queries — null means all shops (super admin). */
export function bookingLocationScope(access: AdminAccess): string | null {
  return access.isSuperAdmin ? null : access.assignedLocationId;
}

/** Build /auth?next=… preserving the current admin deep-link when possible. */
export async function adminAuthRedirectPath() {
  const h = await headers();
  const pathname = h.get("x-glam-pathname") || "/admin";
  const search = h.get("x-glam-search") || "";
  const next = pathname.startsWith("/admin") ? `${pathname}${search}` : "/admin";
  return `/auth?next=${encodeURIComponent(next)}`;
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

/** Whether the current session is a signed-in client (not staff/admin). */
export async function isClientSession(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return !profile || profile.role === "client";
}

export async function requireAdminAccess(): Promise<AdminAccess> {
  const access = await getAdminAccess();
  if (access) return access;

  if (await isClientSession()) {
    redirect("/book");
  }

  redirect(await adminAuthRedirectPath());
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
