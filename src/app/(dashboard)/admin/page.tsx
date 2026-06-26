import { revalidatePath } from "next/cache";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";
import { requireSuperAdmin, requireStaffBookingAccess } from "@/lib/admin/access";
import { BookingsTable, type AdminBookingRow } from "@/components/admin/bookings-table";
import {
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

async function updateBookingStatus(formData: FormData) {
  "use server";
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !statusOptions.includes(status as (typeof statusOptions)[number])) return;

  await requireStaffBookingAccess(id);

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

  await requireSuperAdmin();

  const admin = createAdminClient();
  const [bookingsRes, profilesRes, servicesRes, messagesRes, pendingDepositsRes, recentBookingsRes] =
    await Promise.all([
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
      .select("id", { count: "exact", head: true })
      .eq("deposit_paid", false)
      .gt("deposit_amount", 0)
      .in("status", ["awaiting_approval", "confirmed"]),
    admin
      .from("bookings")
      .select(
        "id, start_at, status, location_id, client_name, client_phone, client_notes, deposit_paid, deposit_amount, profiles(full_name,phone), services(name)",
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
    {
      label: "Unpaid deposits",
      value: `${pendingDepositsRes.count ?? 0}`,
      hint: "awaiting Paystack deposit",
      href: "/admin/appointments?status=awaiting_approval",
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="At-a-glance"
        description="Live operational metrics from Supabase. Use this as your daily command center."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <AdminKpi key={k.label} {...k} />
        ))}
      </div>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl">Appointment operations</h2>
        <p className="mt-2 text-sm text-white/55">
          Confirm, reschedule, or cancel recent booking requests from the salon website.
        </p>
        <div className="mt-5">
          <BookingsTable
            bookings={(recentBookingsRes.data ?? []) as AdminBookingRow[]}
            updateBookingStatus={updateBookingStatus}
            showReschedule={false}
            showStaff={false}
            emptyMessage="No bookings yet."
          />
        </div>
      </section>
    </div>
  );
}
