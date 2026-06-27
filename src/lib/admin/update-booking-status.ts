import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffBookingAccess } from "@/lib/admin/access";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";

export const BOOKING_STATUS_OPTIONS = [
  "pending",
  "awaiting_approval",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
] as const;

export type BookingStatusOption = (typeof BOOKING_STATUS_OPTIONS)[number];

export async function updateBookingStatusAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !BOOKING_STATUS_OPTIONS.includes(status as BookingStatusOption)) return;

  await requireStaffBookingAccess(id);

  const admin = createAdminClient();
  const requestedStartAt = String(formData.get("start_at") ?? "").trim();
  const staffIdRaw = String(formData.get("staff_id") ?? "").trim();
  const adminNotes = String(formData.get("admin_notes") ?? "").trim();

  const { data: existing } = await admin
    .from("bookings")
    .select("status, start_at, end_at, user_id, client_name, client_phone, staff_id, admin_notes")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return;

  let nextStartAt = existing.start_at;
  let nextEndAt = existing.end_at;
  if (requestedStartAt.length > 0) {
    const parsed = new Date(requestedStartAt);
    if (!Number.isNaN(parsed.getTime())) {
      const oldStart = new Date(existing.start_at).getTime();
      const oldEnd = new Date(existing.end_at).getTime();
      const durationMs = Math.max(15 * 60_000, oldEnd - oldStart);
      nextStartAt = parsed.toISOString();
      nextEndAt = new Date(parsed.getTime() + durationMs).toISOString();
    }
  }

  const nextStaffId = staffIdRaw === "none" ? null : staffIdRaw || null;

  const updatePayload: Record<string, unknown> = {
    status,
    start_at: nextStartAt,
    end_at: nextEndAt,
    updated_at: new Date().toISOString(),
  };
  if (formData.has("staff_id")) {
    updatePayload.staff_id = nextStaffId;
  }
  if (formData.has("admin_notes")) {
    updatePayload.admin_notes = adminNotes.length > 0 ? adminNotes : null;
  }

  await admin.from("bookings").update(updatePayload).eq("id", id);

  if (
    existing.status !== status ||
    existing.start_at !== nextStartAt ||
    (formData.has("staff_id") && existing.staff_id !== nextStaffId)
  ) {
    let body = `Your Glam Room booking is now ${status.replaceAll("_", " ")}.`;
    if (existing.start_at !== nextStartAt) {
      body += ` New schedule: ${new Date(nextStartAt).toLocaleString()}.`;
    }

    if (existing.user_id) {
      await admin.from("notifications").insert({
        user_id: existing.user_id,
        title: "Booking update",
        body,
        type: "booking_status",
      });
    }

    let notifyPhone = existing.client_phone;
    if (!notifyPhone && existing.user_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("phone")
        .eq("id", existing.user_id)
        .maybeSingle();
      notifyPhone = profile?.phone ?? null;
    }

    await sendTransactionalMessage({
      toPhone: notifyPhone,
      subject: "Glam Room booking update",
      html: `<p>${body}</p>`,
      smsText: body,
    });
  }

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
  revalidatePath("/admin/customers");
}
