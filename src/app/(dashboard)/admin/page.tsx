import { revalidatePath } from "next/cache";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import {
  AdminBtnPrimary,
  adminFormRowClass,
  AdminKpi,
  AdminPageHeader,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const statusOptions = [
  "awaiting_approval",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
] as const;

function locationLabel(locationId: string | null) {
  if (!locationId) return null;
  return SALON_LOCATIONS.find((l) => l.id === locationId)?.area ?? locationId;
}

async function updateBookingStatus(formData: FormData) {
  "use server";
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !statusOptions.includes(status as (typeof statusOptions)[number])) return;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("bookings")
    .select("status, start_at, end_at, user_id, client_name, client_phone")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return;

  await admin
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (existing.status !== status) {
    let body = `Your Glam Room booking is now ${status.replaceAll("_", " ")}.`;
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

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
}

export default async function AdminOverviewPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }

  const admin = createAdminClient();
  const [bookingsRes, profilesRes, servicesRes, messagesRes, recentBookingsRes] = await Promise.all([
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "awaiting_approval", "confirmed"]),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("services").select("id", { count: "exact", head: true }).eq("active", true),
    admin
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
    admin
      .from("bookings")
      .select(
        "id, start_at, status, location_id, client_name, client_phone, profiles(full_name,phone), services(name)",
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const kpis = [
    {
      label: "Open appointments",
      value: `${bookingsRes.count ?? 0}`,
      hint: "pending + confirmed",
      href: "/admin/appointments",
    },
    {
      label: "Total clients",
      value: `${profilesRes.count ?? 0}`,
      hint: "profiles table",
      href: "/admin/customers",
    },
    {
      label: "Active services",
      value: `${servicesRes.count ?? 0}`,
      hint: "services.active = true",
      href: "/admin/services",
    },
    {
      label: "Unread messages",
      value: `${messagesRes.count ?? 0}`,
      hint: "contact form inbox",
      href: "/admin/messages",
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="At-a-glance"
        description="Live operational metrics from Supabase. Use this as your daily command center."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <AdminKpi key={k.label} {...k} />
        ))}
      </div>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl">Appointment operations</h2>
        <p className="mt-2 text-sm text-white/55">
          Confirm, reschedule, or cancel recent booking requests from the salon website.
        </p>
        <div className="mt-5 space-y-3">
          {(recentBookingsRes.data ?? []).length === 0 ? (
            <p className="text-sm text-white/55">No bookings yet.</p>
          ) : null}
          {(recentBookingsRes.data ?? []).map((b) => {
            const profile = b.profiles as { full_name?: string; phone?: string } | null;
            const clientName = b.client_name ?? profile?.full_name ?? "Guest";
            const loc = locationLabel(b.location_id);

            return (
              <form key={b.id} action={updateBookingStatus} className={adminFormRowClass}>
                <input type="hidden" name="id" value={b.id} />
                <div>
                  <p className="font-medium text-white">
                    {(b.services as { name?: string } | null)?.name ?? "Service"} · {clientName}
                  </p>
                  <p className="text-xs text-white/55">
                    {new Date(b.start_at).toLocaleString()}
                    {loc ? ` · ${loc}` : ""}
                    {b.client_phone ?? profile?.phone ? ` · ${b.client_phone ?? profile?.phone}` : ""}
                  </p>
                </div>
                <select
                  name="status"
                  defaultValue={b.status}
                  className="rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s} className="bg-glam-primary">
                      {s}
                    </option>
                  ))}
                </select>
                <AdminBtnPrimary>Save</AdminBtnPrimary>
              </form>
            );
          })}
        </div>
      </section>
    </div>
  );
}
