import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const adminPanelClass =
  "rounded-xl border border-white/12 bg-glam-primary/55 p-4 backdrop-blur-md sm:p-6";

export const adminKpiClass =
  "rounded-xl border border-white/12 bg-glam-primary/55 p-4 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.5)] backdrop-blur-md";

export const adminFormRowClass =
  "grid gap-3 rounded-xl border border-white/12 bg-glam-primary/45 p-3 backdrop-blur-sm sm:grid-cols-[1fr_auto_auto]";

export const adminBtnPrimary =
  "rounded-md bg-glam-accent px-3 py-2 text-xs font-semibold uppercase tracking-wider text-glam-primary";

export const adminBtnOutline =
  "rounded-md border border-white/25 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/75";

export function AdminBtnPrimary({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button type="submit" className={cn(adminBtnPrimary, className)}>
      {children}
    </button>
  );
}

export const adminTabClass = (active: boolean) =>
  cn(
    "rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider",
    active
      ? "border-glam-accent/60 bg-glam-accent/15 text-glam-accent"
      : "border-white/20 text-white/65 hover:bg-white/10",
  );

export function AdminPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(adminPanelClass, className)}>{children}</div>;
}

export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/12 bg-glam-primary/55 p-4 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.5)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminKpi({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const card = (
    <div className={adminKpiClass}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-glam-accent/90">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-white">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-white/45">{hint}</p> : null}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block transition hover:opacity-90">
        {card}
      </a>
    );
  }

  return card;
}

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header>
      <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
      {description ? <p className="mt-1.5 max-w-2xl text-sm text-white/55">{description}</p> : null}
    </header>
  );
}

export function AdminSetupNotice({ title = "At-a-glance" }: { title?: string }) {
  return (
    <AdminPanel>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-3 text-sm text-white/60">
        Configure <code className="text-glam-accent">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-glam-accent">SUPABASE_SERVICE_ROLE_KEY</code> to load live admin KPIs.
      </p>
    </AdminPanel>
  );
}

export function AdminSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-white/50">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
