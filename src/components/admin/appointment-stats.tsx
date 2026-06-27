import Link from "next/link";
import { adminTabClass } from "@/components/admin/admin-ui";

type Stat = { label: string; value: number; href: string; highlight?: boolean };

export function AppointmentStats({ stats, activeRange }: { stats: Stat[]; activeRange: string }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className={`rounded-2xl border p-4 transition hover:border-glam-accent/40 ${
            stat.highlight
              ? "border-glam-accent/35 bg-glam-accent/10"
              : "border-white/10 bg-black/20"
          }`}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
            {stat.label}
          </p>
          <p className="mt-2 font-display text-3xl text-white">{stat.value}</p>
        </Link>
      ))}
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
        {(["today", "week", "all"] as const).map((range) => (
          <Link
            key={range}
            href={`/admin/appointments?range=${range}`}
            className={adminTabClass(activeRange === range)}
          >
            {range === "today" ? "Today" : range === "week" ? "This week" : "All dates"}
          </Link>
        ))}
      </div>
    </div>
  );
}
