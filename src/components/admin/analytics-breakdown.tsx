import type { AnalyticsBreakdown } from "@/lib/admin/analytics-data";

type BreakdownTableProps = {
  title: string;
  rows: AnalyticsBreakdown[];
  showAmount?: boolean;
  emptyMessage?: string;
};

export function AnalyticsBreakdownTable({
  title,
  rows,
  showAmount = false,
  emptyMessage = "No data yet.",
}: BreakdownTableProps) {
  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h2 className="font-display text-lg text-white">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-white/45">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-white/85">{row.label}</span>
                <span className="shrink-0 text-white/55">
                  {row.count}
                  {showAmount && row.amount != null && row.amount > 0
                    ? ` · ₵${row.amount.toLocaleString()}`
                    : ""}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-glam-accent/80"
                  style={{ width: `${Math.max(4, (row.count / maxCount) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
