import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const adminPanelClass =
  "rounded-xl border border-white/12 bg-glam-primary/60 p-4 backdrop-blur-md sm:p-5";

export const adminKpiClass =
  "rounded-xl border border-white/12 bg-glam-primary/60 p-3.5 shadow-[0_12px_40px_-28px_rgba(10,8,12,0.55)] backdrop-blur-md";

export const adminFormRowClass =
  "grid gap-3 rounded-xl border border-white/12 bg-glam-primary/45 p-3 backdrop-blur-sm sm:grid-cols-[1fr_auto_auto]";

export const adminFilterBarClass =
  "flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-black/25 p-3";

export const adminInputClass =
  "mt-1 block w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-white";

export const adminBtnPrimary =
  "inline-flex items-center justify-center rounded-md bg-glam-accent px-3 py-2 text-xs font-semibold uppercase tracking-wider text-glam-primary transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98]";

export const adminBtnOutline =
  "inline-flex items-center justify-center rounded-md border border-white/25 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 transition-[transform,background-color,color] duration-150 hover:bg-white/10 hover:text-white active:scale-[0.98]";

export const adminBtnGhost =
  "inline-flex items-center justify-center rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/55 transition-[transform,color] duration-150 hover:text-white active:scale-[0.98]";

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
    "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wider transition-[transform,background-color,color] duration-150 active:scale-[0.98]",
    active
      ? "border-glam-accent/60 bg-glam-accent/15 text-glam-accent"
      : "border-white/20 text-white/65 hover:bg-white/10 hover:text-white",
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
        "rounded-xl border border-white/12 bg-glam-primary/60 p-4 shadow-[0_12px_40px_-28px_rgba(10,8,12,0.55)] backdrop-blur-md",
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
      <p className="mt-1.5 font-display text-2xl tabular-nums text-white sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block transition-opacity duration-150 hover:opacity-90 active:scale-[0.99]">
        {card}
      </a>
    );
  }

  return card;
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl text-balance sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 hidden max-w-2xl text-sm text-pretty text-white/55 sm:block">
            {description}
          </p>
        ) : null}
      </div>
      {action}
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
    <section className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 sm:mb-4">
        <div>
          <h2 className="font-display text-lg text-white sm:text-xl">{title}</h2>
          {description ? (
            <p className="mt-1 hidden text-sm text-white/50 sm:block">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminFilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(adminFilterBarClass, className)}>{children}</div>;
}

export const adminChipStripClass =
  "flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function AdminChipStrip({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(adminChipStripClass, className)}>
      {label ? (
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-white/45">
          {label}
        </span>
      ) : null}
      {children}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-10 text-center">
      <p className="font-display text-lg text-white">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-white/50">{description}</p> : null}
      {actionHref && actionLabel ? (
        <a href={actionHref} className={cn(adminBtnOutline, "mt-4")}>
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}
