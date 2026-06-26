import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";
import {
  bookingLocationScope,
  requireAdminAccess,
  requireStaffBookingAccess,
} from "@/lib/admin/access";
import { BookingsTable, type AdminBookingRow } from "@/components/admin/bookings-table";
import {
  adminBtnOutline,
  AdminPanel,
  adminTabClass,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

const statusOptions = [
  "awaiting_approval",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
] as const;

const statusTabs = ["all", ...statusOptions] as const;

async function updateBookingStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !statusOptions.includes(status as (typeof statusOptions)[number])) return;

  await requireStaffBookingAccess(id);

  const admin = createAdminClient();
  const requestedStartAt = String(formData.get("start_at") ?? "").trim();

  const { data: existing } = await admin
    .from("bookings")
    .select("status, start_at, end_at, user_id, client_name, client_phone")
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

  await admin
    .from("bookings")
    .update({
      status,
      start_at: nextStartAt,
      end_at: nextEndAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (existing.status !== status || existing.start_at !== nextStartAt) {
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
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminAppointmentsPage({ searchParams }: { searchParams: SearchParams }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Appointments" />;
  }

  const access = await requireAdminAccess();
  const locationScope = bookingLocationScope(access);

  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : "all";
  const statusFilter = statusTabs.includes(statusParam as (typeof statusTabs)[number])
    ? statusParam
    : "all";
  const fromDate = typeof params.from === "string" ? params.from : "";
  const toDate = typeof params.to === "string" ? params.to : "";

  const admin = createAdminClient();
  let query = admin
    .from("bookings")
    .select(
      "id, start_at, status, location_type, location_id, client_name, client_phone, client_notes, deposit_paid, deposit_amount, profiles(full_name,phone), services(name), staff(name)",
    )
    .order("start_at", { ascending: false });
  if (locationScope) query = query.eq("location_id", locationScope);
  if (statusFilter !== "all") query = query.eq("status", statusFilter);
  if (fromDate) query = query.gte("start_at", new Date(fromDate).toISOString());
  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte("start_at", end.toISOString());
  }
  const { data } = await query.limit(80);

  function tabHref(nextStatus: string) {
    const qs = new URLSearchParams();
    if (nextStatus !== "all") qs.set("status", nextStatus);
    if (fromDate) qs.set("from", fromDate);
    if (toDate) qs.set("to", toDate);
    const q = qs.toString();
    return q ? `/admin/appointments?${q}` : "/admin/appointments";
  }

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Appointments</h1>
      {!access.isSuperAdmin && access.assignedLocationLabel ? (
        <p className="mt-2 text-sm text-white/55">
          Showing bookings for <span className="text-glam-accent">{access.assignedLocationLabel}</span> only
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <a key={tab} href={tabHref(tab)} className={adminTabClass(statusFilter === tab)}>
            {tab}
          </a>
        ))}
      </div>
      <form action="/admin/appointments" className="mt-4 flex flex-wrap items-end gap-3 text-xs text-white/65">
        <input type="hidden" name="status" value={statusFilter} />
        <label>
          From
          <input
            type="date"
            name="from"
            defaultValue={fromDate}
            className="mt-1 rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
          />
        </label>
        <label>
          To
          <input
            type="date"
            name="to"
            defaultValue={toDate}
            className="mt-1 rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm text-white"
          />
        </label>
        <button type="submit" className={adminBtnOutline}>
          Apply range
        </button>
      </form>
      <div className="mt-6">
        <BookingsTable
          bookings={(data ?? []) as AdminBookingRow[]}
          updateBookingStatus={updateBookingStatus}
        />
      </div>
    </AdminPanel>
  );
}
