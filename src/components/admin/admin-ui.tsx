import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const adminPanelClass =
  "rounded-3xl border border-white/15 bg-glam-primary/55 p-6 backdrop-blur-md sm:p-10";

export const adminKpiClass =
  "rounded-3xl border border-white/15 bg-glam-primary/55 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)] backdrop-blur-md";

export const adminFormRowClass =
  "grid gap-3 rounded-2xl border border-white/15 bg-glam-primary/45 p-4 backdrop-blur-sm sm:grid-cols-[1fr_auto_auto]";

export const adminBtnPrimary =
  "rounded-full bg-glam-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-glam-primary";

export const adminBtnOutline =
  "rounded-full border border-white/25 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/75";

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
    "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
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
        "rounded-3xl border border-white/15 bg-glam-primary/55 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)] backdrop-blur-md",
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
      <p className="text-xs font-semibold uppercase tracking-wider text-glam-accent/90">{label}</p>
      <p className="mt-4 font-display text-4xl text-white">{value}</p>
      {hint ? <p className="mt-3 text-xs text-white/45">{hint}</p> : null}
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
      <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-white/55">{description}</p> : null}
    </header>
  );
}

export function AdminSetupNotice({ title = "At-a-glance" }: { title?: string }) {
  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="mt-3 text-sm text-white/60">
        Configure <code className="text-glam-accent">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-glam-accent">SUPABASE_SERVICE_ROLE_KEY</code> to load live admin KPIs.
      </p>
    </AdminPanel>
  );
}
