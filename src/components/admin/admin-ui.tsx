import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

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
        "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]",
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
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <AdminCard>
      <p className="text-xs font-semibold uppercase tracking-wider text-glam-accent">{label}</p>
      <p className="heading-display mt-4 text-4xl text-white">{value}</p>
      {hint ? <p className="mt-3 text-xs text-white/45">{hint}</p> : null}
    </AdminCard>
  );
}

export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10">
      <h1 className="heading-display text-3xl text-white sm:text-4xl">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-white/55">{description}</p> : null}
    </header>
  );
}

export function AdminSetupNotice() {
  return (
    <AdminCard>
      <h1 className="heading-display text-3xl text-white">Dashboard</h1>
      <p className="mt-3 text-sm text-white/60">
        Configure <code className="text-glam-accent">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-glam-accent">SUPABASE_SERVICE_ROLE_KEY</code> to load live data.
      </p>
    </AdminCard>
  );
}
