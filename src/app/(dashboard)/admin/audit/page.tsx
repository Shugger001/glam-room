import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminSetupNotice,
  adminBtnOutline,
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

type AuditRow = {
  id: string;
  target_user_id: string;
  actor_user_id: string;
  previous_role: string;
  next_role: string;
  reason: string | null;
  created_at: string;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const pageSize = 40;

export default async function AdminAuditPage({ searchParams }: { searchParams: SearchParams }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Audit log" />;
  }

  await requireSuperAdmin();

  const params = await searchParams;
  const pageRaw = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const admin = createAdminClient();
  let rows: AuditRow[] = [];
  let total = 0;
  let tableMissing = false;

  try {
    const { data, count, error } = await admin
      .from("role_audit_log")
      .select("id, target_user_id, actor_user_id, previous_role, next_role, reason, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      tableMissing = true;
    } else {
      rows = (data ?? []) as AuditRow[];
      total = count ?? rows.length;
    }
  } catch {
    tableMissing = true;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showingFrom = total === 0 ? 0 : from + 1;
  const showingTo = Math.min(to + 1, total);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Audit log"
        description="Role changes across CRM — who changed what, and why."
      />

      {tableMissing ? (
        <AdminEmptyState
          title="Audit log unavailable"
          description="The role_audit_log table is missing or unreachable. Apply migrations, then try again."
          actionHref="/admin/settings"
          actionLabel="Open settings"
        />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          title="No role changes yet"
          description="When a super admin updates a profile role in CRM, it will appear here."
          actionHref="/admin/customers"
          actionLabel="Open CRM"
        />
      ) : (
        <AdminPanel className="!p-0 overflow-hidden">
          <p className="border-b border-white/10 px-4 py-3 text-xs tabular-nums text-white/45">
            Showing {showingFrom}–{showingTo} of {total}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-white/45">
                  <th className="px-4 py-2.5">When</th>
                  <th className="px-4 py-2.5">Change</th>
                  <th className="px-4 py-2.5">Target</th>
                  <th className="px-4 py-2.5">Actor</th>
                  <th className="px-4 py-2.5">Reason</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/10 hover:bg-white/[0.03]">
                    <td className="px-4 py-2.5 tabular-nums text-white/70">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-white/85">
                      <span className="text-white/70">{row.previous_role}</span>
                      {" → "}
                      <span className="text-glam-accent">{row.next_role}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-white/55">
                      {row.target_user_id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-white/55">
                      {row.actor_user_id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-2.5 text-white/60">{row.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs text-white/60">
              <p className="tabular-nums">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <a
                  href={page > 1 ? `/admin/audit?page=${page - 1}` : "/admin/audit"}
                  className={adminBtnOutline}
                >
                  Prev
                </a>
                <a
                  href={`/admin/audit?page=${Math.min(totalPages, page + 1)}`}
                  className={adminBtnOutline}
                >
                  Next
                </a>
              </div>
            </div>
          ) : null}
        </AdminPanel>
      )}
    </div>
  );
}
