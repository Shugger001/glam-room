"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffBookingAccess } from "@/lib/admin/access";
import { finalizePaidBooking } from "@/lib/booking/finalize-paid-booking";
import { redirectBackWithFlash } from "@/lib/admin/flash-redirect";

/** Mark a booking deposit paid (cash / MoMo at desk) and auto-confirm the chair. */
export async function markDepositPaidAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await requireStaffBookingAccess(id);

  const admin = createAdminClient();
  const result = await finalizePaidBooking(admin, id, {
    notifySalonDeposit: true,
    source: "desk",
  });

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/customers");

  if (!result.ok) {
    return redirectBackWithFlash("error", result.reason ?? "Could not mark deposit paid");
  }

  const message = result.confirmed
    ? "Deposit marked paid — booking confirmed"
    : result.alreadyPaid
      ? "Deposit already paid"
      : "Deposit marked paid";
  return redirectBackWithFlash("success", message);
}
