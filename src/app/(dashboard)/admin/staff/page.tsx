import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { AdminPanel, AdminSetupNotice } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Staff" />;
  }

  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data: staff } = await admin
    .from("staff")
    .select("id, name, role, experience, specialty, active")
    .order("sort_order", { ascending: true });

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Staff</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Manage stylist profiles and specialties.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(staff ?? []).map((s) => (
          <div key={s.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="font-medium text-white">{s.name}</p>
            <p className="text-sm text-glam-accent">{s.role}</p>
            <p className="mt-2 text-sm text-white/55">{s.experience}</p>
            {Array.isArray(s.specialty) ? (
              <div className="mt-3 flex flex-wrap gap-1">
                {(s.specialty as string[]).map((sp) => (
                  <span key={sp} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                    {sp}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
