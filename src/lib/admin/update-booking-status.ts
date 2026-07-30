import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffBookingAccess } from "@/lib/admin/access";
import { redirectBackWithFlash } from "@/lib/admin/flash-redirect";
import {
  isStaffScheduleAvailable,
  validateBookingCapacity,
} from "@/lib/booking/availability";
import { assertBookableStaff } from "@/lib/booking/staff-assignment";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";

export const BOOKING_STATUS_OPTIONS = [
  "pending",
  "awaiting_approval",
  "confirmed",
  "arrived",
  "rejected",
  "cancelled",
  "completed",
  "no_show",
] as const;

export type BookingStatusOption = (typeof BOOKING_STATUS_OPTIONS)[number];

function localBookingDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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
    .select(
      "status, start_at, end_at, user_id, client_name, client_phone, staff_id, admin_notes, location_id",
    )
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
  const effectiveStaffId = formData.has("staff_id") ? nextStaffId : existing.staff_id;
  const scheduleChanged = existing.start_at !== nextStartAt;
  const staffChanged = formData.has("staff_id") && existing.staff_id !== nextStaffId;

  if (effectiveStaffId && existing.location_id && (staffChanged || scheduleChanged)) {
    const staffOk = await assertBookableStaff(admin, effectiveStaffId, existing.location_id);
    if (!staffOk.ok) {
      return redirectBackWithFlash("error", staffOk.error);
    }
  }

  if (scheduleChanged && existing.location_id) {
    const capacity = await validateBookingCapacity(admin, {
      startAt: nextStartAt,
      locationId: existing.location_id,
      bookingDate: localBookingDate(nextStartAt),
    });
    if (!capacity.available) {
      return redirectBackWithFlash("error", capacity.error ?? "That time slot is full.");
    }
  }

  if (effectiveStaffId && (scheduleChanged || staffChanged)) {
    const schedule = await isStaffScheduleAvailable(admin, {
      staffId: effectiveStaffId,
      startAt: nextStartAt,
      endAt: nextEndAt,
      excludeBookingId: id,
    });
    if (!schedule.available) {
      return redirectBackWithFlash("error", schedule.error ?? "Stylist is booked.");
    }
  }

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

  if (existing.status !== status || scheduleChanged || staffChanged) {
    let body = `Your Glam Room booking is now ${status.replaceAll("_", " ")}.`;
    if (scheduleChanged) {
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
  return redirectBackWithFlash("success", "Booking updated");
}
