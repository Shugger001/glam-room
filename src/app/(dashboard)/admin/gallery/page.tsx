import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { AdminPanel, AdminSetupNotice } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Gallery" />;
  }

  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data: items } = await admin
    .from("gallery")
    .select("id, alt, category, published, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Gallery</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Manage portfolio images and categories.
      </p>
      <div className="mt-6 space-y-3">
        {(items ?? []).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div>
              <p className="font-medium text-white">{item.alt}</p>
              <p className="text-sm capitalize text-white/55">{item.category}</p>
            </div>
            <span className="text-xs text-white/50">
              {item.published ? "Published" : "Draft"}
            </span>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
