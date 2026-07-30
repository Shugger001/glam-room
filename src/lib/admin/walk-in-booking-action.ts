"use server";

import { revalidatePath } from "next/cache";
import { bookingLocationScope, locationLabelFromId, requireAdminAccess } from "@/lib/admin/access";
import { createWalkInBooking } from "@/lib/admin/create-walk-in-booking";
import { redirectBackWithFlash } from "@/lib/admin/flash-redirect";
import { parseAdminWalkInForm } from "@/lib/validation/admin-walk-in";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createWalkInBookingAction(formData: FormData) {
  const access = await requireAdminAccess();
  const parsed = parseAdminWalkInForm(formData);
  if (!parsed.success) {
    return redirectBackWithFlash("error", "Could not create walk-in. Check required fields.");
  }

  const locationScope = bookingLocationScope(access);
  if (locationScope && parsed.data.locationId !== locationScope) {
    return redirectBackWithFlash("error", "That shop is outside your assignment.");
  }

  const admin = createAdminClient();
  const { data: serviceRow } = await admin
    .from("services")
    .select("id, duration_minutes, base_price, location_ids, active")
    .eq("id", parsed.data.serviceId)
    .maybeSingle();
  if (!serviceRow || serviceRow.active === false) {
    return redirectBackWithFlash("error", "Service not found.");
  }

  const serviceLocationIds = Array.isArray(serviceRow.location_ids)
    ? (serviceRow.location_ids as string[])
    : [];
  if (
    serviceLocationIds.length > 0 &&
    !serviceLocationIds.includes(parsed.data.locationId)
  ) {
    return redirectBackWithFlash(
      "error",
      "That service is only offered at another shop (e.g. nails/makeup at Madina).",
    );
  }

  const { staffId: formStaffId, ...walkInValues } = parsed.data;

  const created = await createWalkInBooking(admin, {
    ...walkInValues,
    staffId: formStaffId?.trim() || null,
    locationLabel: locationLabelFromId(parsed.data.locationId) ?? parsed.data.locationId,
    service: {
      id: serviceRow.id as string,
      durationMinutes: Number(serviceRow.duration_minutes),
      price: Number(serviceRow.base_price),
    },
    createdByUserId: access.userId,
  });

  if (!created.ok) {
    return redirectBackWithFlash("error", created.error);
  }

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
  return redirectBackWithFlash("success", "Walk-in booking created");
}
