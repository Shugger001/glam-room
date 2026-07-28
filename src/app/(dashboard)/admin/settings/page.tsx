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
  const gaReady = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
  const posthogReady = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
  // Vercel Analytics ships in the app; enable once in the Vercel project dashboard.
  const vercelAnalyticsShipped = true;

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
        <StatusRow
          label="Vercel Web Analytics"
          ok={vercelAnalyticsShipped}
          detail="Visitor traffic + Speed Insights are in the app. Open Vercel → Project → Analytics and click Enable if you haven't yet."
        />
        <StatusRow
          label="Google Analytics"
          ok={gaReady}
          detail={
            gaReady
              ? "gtag is loading on every page"
              : "Optional: set NEXT_PUBLIC_GA_MEASUREMENT_ID (G-…) in Vercel"
          }
        />
        <StatusRow
          label="PostHog"
          ok={posthogReady}
          detail={
            posthogReady
              ? "Product analytics capturing pageviews"
              : "Optional: set NEXT_PUBLIC_POSTHOG_KEY in Vercel"
          }
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
          Vercel Cron runs daily at 08:00 UTC →{" "}
          <code className="text-glam-accent">
            GET {appUrl === "Not set" ? "https://your-domain.vercel.app" : appUrl}/api/cron/reminders
          </code>
          . Requires <code className="text-glam-accent">CRON_SECRET</code> in Vercel env (Authorization bearer).
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-white/70">
        <p className="font-medium text-amber-100">Notification setup (Vercel → Settings → Environment Variables)</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            <strong className="text-white">Email (Resend):</strong>{" "}
            <code className="text-glam-accent">RESEND_API_KEY</code>,{" "}
            <code className="text-glam-accent">RESEND_FROM_EMAIL</code> (verified domain),{" "}
            <code className="text-glam-accent">SALON_NOTIFY_EMAIL</code>
          </li>
          <li>
            <strong className="text-white">SMS (Twilio):</strong>{" "}
            <code className="text-glam-accent">TWILIO_ACCOUNT_SID</code>,{" "}
            <code className="text-glam-accent">TWILIO_AUTH_TOKEN</code>,{" "}
            <code className="text-glam-accent">TWILIO_FROM_NUMBER</code>,{" "}
            <code className="text-glam-accent">SALON_NOTIFY_PHONE</code>
          </li>
          <li>
            <strong className="text-white">Deposits (Paystack):</strong>{" "}
            <code className="text-glam-accent">PAYSTACK_SECRET_KEY</code>,{" "}
            <code className="text-glam-accent">NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code>
          </li>
        </ol>
        <p className="mt-3 text-white/50">
          After adding vars, redeploy production. Status rows above turn green when each integration is live.
        </p>
      </div>
    </AdminPanel>
  );
}
