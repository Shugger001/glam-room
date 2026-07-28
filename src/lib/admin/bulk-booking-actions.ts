"use server";

import { revalidatePath } from "next/cache";
import { bookingLocationScope, requireAdminAccess } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

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
  if (error) return;

  const ids = (data ?? []).map((r) => r.id);
  if (ids.length === 0) return;

  const { error: updateError } = await admin
    .from("bookings")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .in("id", ids);

  if (updateError) return;

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
}
