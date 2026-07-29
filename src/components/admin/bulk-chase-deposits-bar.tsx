import { buildChaseDepositLink } from "@/lib/notifications/whatsapp-links";
import { adminBtnOutline } from "@/components/admin/admin-ui";

export type ChaseDepositTarget = {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  when: string;
  amountLabel: string;
};

export function BulkChaseDepositsBar({ targets }: { targets: ChaseDepositTarget[] }) {
  if (targets.length === 0) return null;

  const links = targets
    .map((t) => ({
      ...t,
      href: buildChaseDepositLink(
        t.clientPhone,
        t.clientName,
        t.serviceName,
        t.when,
        t.amountLabel,
      ),
    }))
    .filter((t) => t.href);

  if (links.length === 0) return null;

  return (
    <details className="rounded-xl border border-amber-400/30 bg-amber-500/10 open:bg-amber-500/[0.12]">
      <summary className="cursor-pointer list-none px-3 py-3 marker:content-none sm:px-4 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">
              {links.length} unpaid · chase on WhatsApp
            </p>
            <p className="mt-0.5 hidden text-xs text-white/55 sm:block">
              Opens a prefilled message asking the client to complete their deposit.
            </p>
          </div>
          <span className={adminBtnOutline}>Show list</span>
        </div>
      </summary>
      <ul className="space-y-2 border-t border-amber-400/20 px-3 py-3 sm:px-4">
        {links.map((t) => (
          <li
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3"
          >
            <div>
              <p className="text-sm text-white">{t.clientName}</p>
              <p className="mt-0.5 text-xs text-white/50">
                {t.serviceName} · {t.when} · {t.amountLabel}
              </p>
            </div>
            <a
              href={t.href!}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-md border border-amber-300/40 px-3 text-xs font-semibold uppercase tracking-wider text-amber-100 active:bg-amber-400/15"
            >
              Chase
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
