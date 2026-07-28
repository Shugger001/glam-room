import { loadIntegrationHealth } from "@/lib/admin/integration-health";
import type { IntegrationHealth } from "@/lib/admin/integration-health";
import { AdminCard } from "@/components/admin/admin-ui";

function HealthPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
        ok ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-200"
      }`}
    >
      {label}
    </span>
  );
}

export function AdminIntegrationSnapshot({ health }: { health: IntegrationHealth }) {
  const readyCount = [
    health.paystackConfigured,
    health.notifications.hasEmail,
    health.cronConfigured,
    health.supabaseOk,
  ].filter(Boolean).length;

  return (
    <AdminCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl">Integrations</h2>
          <p className="mt-2 text-sm text-white/55">
            {readyCount}/4 core services ready · {health.unpaidDepositsOpen} open unpaid deposits
          </p>
        </div>
        <a
          href="/admin/settings"
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:bg-white/10"
        >
          Open settings
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <HealthPill ok={health.paystackConfigured} label="Paystack" />
        <HealthPill ok={health.notifications.hasEmail} label="Email" />
        <HealthPill ok={health.notifications.hasSms} label="SMS" />
        <HealthPill ok={health.cronConfigured} label="Cron" />
        <HealthPill ok={health.supabaseOk} label="Database" />
      </div>
      {health.deadLettersLast7d > 0 ? (
        <p className="mt-4 text-xs text-amber-200/90">
          {health.deadLettersLast7d} ops error{health.deadLettersLast7d === 1 ? "" : "s"} in the last 7 days — check Settings.
        </p>
      ) : null}
    </AdminCard>
  );
}

export async function loadAdminIntegrationSnapshot(admin: Parameters<typeof loadIntegrationHealth>[0]) {
  return loadIntegrationHealth(admin);
}
