"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffBookingAccess } from "@/lib/admin/access";

/** Mark a booking deposit paid (cash / MoMo at desk). */
export async function markDepositPaidAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await requireStaffBookingAccess(id);

  const admin = createAdminClient();
  await admin
    .from("bookings")
    .update({
      deposit_paid: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/customers");
}
