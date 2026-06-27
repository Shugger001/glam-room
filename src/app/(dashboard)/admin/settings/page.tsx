import { requireSuperAdmin } from "@/lib/admin/access";
import { loadIntegrationHealth } from "@/lib/admin/integration-health";
import { BOOKING_DEPOSIT_GHS, isPaystackConfigured } from "@/lib/booking/deposit";
import { AdminPanel } from "@/components/admin/admin-ui";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const admin = createAdminClient();
  const health = await loadIntegrationHealth(admin);

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Operational checklist and integration health. Secrets stay in Vercel env.
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
              : "Set SALON_NOTIFY_EMAIL + RESEND_API_KEY (+ RESEND_FROM_EMAIL)"
          }
        />
        <StatusRow
          label="Salon SMS alerts"
          ok={notify.hasSms}
          detail={
            notify.hasSms
              ? `Sending to ${notify.salonPhone} via Twilio`
              : "Set SALON_NOTIFY_PHONE + Twilio credentials"
          }
        />
        <StatusRow
          label="Site URL"
          ok={health.appUrlSet}
          detail={`Paystack callback + admin links use ${appUrl}`}
        />
        <StatusRow
          label="Cron reminders"
          ok={health.cronConfigured}
          detail={
            health.cronConfigured
              ? "CRON_SECRET set · /api/cron/reminders can run on schedule"
              : "Set CRON_SECRET in Vercel and schedule GET /api/cron/reminders"
          }
        />
        <StatusRow
          label="Supabase connection"
          ok={health.supabaseOk}
          detail={health.supabaseOk ? "Service role can reach the database" : "Check Supabase URL and service role key"}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-display text-xl">Integration health (7 days)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/45">Paystack webhooks received</p>
            <p className="mt-2 font-display text-3xl text-white">{health.webhooksLast7d}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/45">Deposits paid (7d)</p>
            <p className="mt-2 font-display text-3xl text-glam-accent">{health.paidDepositsLast7d}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/45">Unpaid deposits (open)</p>
            <p className="mt-2 font-display text-3xl text-amber-200">{health.unpaidDepositsOpen}</p>
            <a href="/admin/appointments?status=awaiting_approval" className="mt-2 inline-block text-xs text-glam-accent hover:underline">
              View in appointments
            </a>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wider text-white/45">Ops errors (7d)</p>
            <p className={`mt-2 font-display text-3xl ${health.deadLettersLast7d > 0 ? "text-red-300" : "text-white"}`}>
              {health.deadLettersLast7d}
            </p>
          </div>
        </div>
        {health.recentDeadLetters.length > 0 ? (
          <ul className="mt-4 space-y-2 text-xs text-white/60">
            {health.recentDeadLetters.map((row, i) => (
              <li key={`${row.created_at}-${i}`} className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                {new Date(row.created_at).toLocaleString()} · {row.message}
              </li>
            ))}
          </ul>
        ) : null}
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
        <p className="mt-3 font-medium text-white">Reminder cron</p>
        <p className="mt-2">
          Schedule:{" "}
          <code className="text-glam-accent">
            GET {appUrl === "Not set" ? "https://your-domain.vercel.app" : appUrl}/api/cron/reminders
          </code>{" "}
          with header <code className="text-glam-accent">Authorization: Bearer CRON_SECRET</code>
        </p>
      </div>
    </AdminPanel>
  );
}
