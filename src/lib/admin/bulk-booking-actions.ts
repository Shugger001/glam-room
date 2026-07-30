"use server";

import { revalidatePath } from "next/cache";
import { bookingLocationScope, requireAdminAccess } from "@/lib/admin/access";
import { redirectBackWithFlash } from "@/lib/admin/flash-redirect";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyClientBookingUpdate } from "@/lib/notifications/booking-notifications";

/** Confirm all deposit-paid bookings still awaiting approval (optionally scoped to one shop). */
export async function bulkConfirmPaidBookingsAction(formData: FormData): Promise<void> {
  const access = await requireAdminAccess();
  const locationScope = bookingLocationScope(access);
  const locationId = String(formData.get("location_id") ?? "").trim() || locationScope;

  const admin = createAdminClient();
  let query = admin
    .from("bookings")
    .select("id")
    .in("status", ["pending", "awaiting_approval"])
    .eq("deposit_paid", true);

  if (locationId) query = query.eq("location_id", locationId);

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    return redirectBackWithFlash("error", "No paid bookings waiting for approval");
  }

  const ids = data.map((r) => r.id);

  const { error: updateError } = await admin
    .from("bookings")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .in("id", ids);

  if (updateError) {
    return redirectBackWithFlash("error", "Could not confirm bookings");
  }

  await Promise.allSettled(ids.map((id) => notifyClientBookingUpdate(admin, id, "confirmed")));

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  return redirectBackWithFlash("success", `Confirmed ${ids.length} booking${ids.length === 1 ? "" : "s"}`);
}
