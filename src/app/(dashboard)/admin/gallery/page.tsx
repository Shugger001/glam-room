import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader, AdminSetupNotice, AdminCard } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }
  const admin = createAdminClient();
  const { data: items } = await admin
    .from("gallery")
    .select("id, alt, category, published, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <AdminPageHeader title="Gallery" description="Manage portfolio images and categories." />
      <div className="space-y-3">
        {(items ?? []).map((item) => (
          <AdminCard key={item.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">{item.alt}</p>
              <p className="text-sm capitalize text-white/55">{item.category}</p>
            </div>
            <span className="text-xs text-white/50">
              {item.published ? "Published" : "Draft"}
            </span>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
