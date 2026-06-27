"use server";

import { revalidatePath } from "next/cache";
import { bookingLocationScope, locationLabelFromId, requireAdminAccess } from "@/lib/admin/access";
import { createWalkInBooking } from "@/lib/admin/create-walk-in-booking";
import { parseAdminWalkInForm } from "@/lib/validation/admin-walk-in";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createWalkInBookingAction(formData: FormData) {
  const access = await requireAdminAccess();
  const parsed = parseAdminWalkInForm(formData);
  if (!parsed.success) return;

  const locationScope = bookingLocationScope(access);
  if (locationScope && parsed.data.locationId !== locationScope) return;

  const admin = createAdminClient();
  const { data: serviceRow } = await admin
    .from("services")
    .select("id, duration_minutes, base_price")
    .eq("id", parsed.data.serviceId)
    .maybeSingle();
  if (!serviceRow) return;

  const { staffId: formStaffId, ...walkInValues } = parsed.data;

  await createWalkInBooking(admin, {
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

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}
