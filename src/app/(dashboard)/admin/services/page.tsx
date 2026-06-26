import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPanel, AdminSetupNotice } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Services" />;
  }
  const admin = createAdminClient();
  const { data: services } = await admin
    .from("services")
    .select("id, name, duration_minutes, base_price, category, active")
    .order("sort_order", { ascending: true });

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Services</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Manage salon services, pricing, and availability.
      </p>
      <div className="mt-6 space-y-3">
        {(services ?? []).map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"
          >
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
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
