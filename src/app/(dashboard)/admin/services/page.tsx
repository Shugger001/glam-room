import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader, AdminSetupNotice, AdminCard } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }
  const admin = createAdminClient();
  const { data: services } = await admin
    .from("services")
    .select("id, name, duration_minutes, base_price, category, active")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <AdminPageHeader title="Services" description="Manage salon services, pricing, and availability." />
      <div className="space-y-3">
        {(services ?? []).map((s) => (
          <AdminCard key={s.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">{s.name}</p>
              <p className="text-sm text-white/55">
                {s.duration_minutes} min · ₵{Number(s.base_price).toLocaleString()}
                {s.category ? ` · ${s.category}` : ""}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                s.active ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
              }`}
            >
              {s.active ? "Active" : "Inactive"}
            </span>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
