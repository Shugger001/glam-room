import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader, AdminSetupNotice, AdminCard } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }
  const admin = createAdminClient();
  const { data: promos } = await admin
    .from("promotions")
    .select("id, title, code, discount_percent, discount_amount, active, starts_at, ends_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader title="Promotions" description="Manage discount codes and seasonal offers." />
      <div className="space-y-3">
        {(promos ?? []).map((p) => (
          <AdminCard key={p.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">{p.title}</p>
              <p className="text-sm text-white/55">
                {p.code ? `Code: ${p.code}` : "No code"}
                {p.discount_percent ? ` · ${p.discount_percent}% off` : ""}
                {p.discount_amount ? ` · ₵${Number(p.discount_amount).toLocaleString()} off` : ""}
              </p>
            </div>
            <span className={p.active ? "text-green-300" : "text-white/40"}>
              {p.active ? "Active" : "Inactive"}
            </span>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
