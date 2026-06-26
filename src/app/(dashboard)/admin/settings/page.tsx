import { requireSuperAdmin } from "@/lib/admin/access";
import { BOOKING_DEPOSIT_GHS, isPaystackConfigured } from "@/lib/booking/deposit";
import { AdminPanel } from "@/components/admin/admin-ui";
import { notificationsConfigured } from "@/lib/notifications/salon-contact";

export const dynamic = "force-dynamic";

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="mt-1 text-sm text-white/55">{detail}</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
          ok ? "bg-green-500/20 text-green-300" : "bg-amber-500/15 text-amber-200"
        }`}
      >
        {ok ? "Ready" : "Setup needed"}
      </span>
    </div>
  );
}

export default async function AdminSettingsPage() {
  await requireSuperAdmin();

  const paystack = isPaystackConfigured();
  const notify = notificationsConfigured();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "Not set";

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Operational checklist for bookings, deposits, and alerts. Secrets stay in Vercel env — never
        in the database.
      </p>

      <div className="mt-8 space-y-3">
        <StatusRow
          label="Paystack deposits"
          ok={paystack}
          detail={
            paystack
              ? `Live checkout enabled · flat ${BOOKING_DEPOSIT_GHS} GHS deposit per booking`
              : "Set PAYSTACK_SECRET_KEY in Vercel to collect ₵50 deposits at booking"
          }
        />
        <StatusRow
          label="Salon email alerts"
          ok={notify.hasEmail}
          detail={
            notify.hasEmail
              ? `Sending to ${notify.salonEmail} via Resend`
              : "Set SALON_NOTIFY_EMAIL + RESEND_API_KEY (+ RESEND_FROM_EMAIL) for new booking emails"
          }
        />
        <StatusRow
          label="Salon SMS alerts"
          ok={notify.hasSms}
          detail={
            notify.hasSms
              ? `Sending to ${notify.salonPhone} via Twilio`
              : "Set SALON_NOTIFY_PHONE (or NEXT_PUBLIC_WHATSAPP_BOOKING_NUMBER) + Twilio credentials"
          }
        />
        <StatusRow
          label="Site URL"
          ok={Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim())}
          detail={`Paystack callback + admin links use ${appUrl}`}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/55">
        <p className="font-medium text-white">Paystack webhook</p>
        <p className="mt-2">
          Register in Paystack dashboard:{" "}
          <code className="text-glam-accent">
            {appUrl === "Not set" ? "https://your-domain.vercel.app" : appUrl}
            /api/paystack/webhook
          </code>
        </p>
        <p className="mt-3 font-medium text-white">Database</p>
        <p className="mt-2">
          Ensure migration <code className="text-glam-accent">00011_booking_paystack_reference</code>{" "}
          is applied so Paystack references can be stored on bookings.
        </p>
      </div>
    </AdminPanel>
  );
}
