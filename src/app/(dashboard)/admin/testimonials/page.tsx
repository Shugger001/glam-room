import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader, AdminSetupNotice, AdminCard } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice />;
  }
  const admin = createAdminClient();
  const { data: items } = await admin
    .from("testimonials")
    .select("id, name, service, rating, quote, published")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <AdminPageHeader title="Testimonials" description="Manage client reviews and ratings." />
      <div className="space-y-4">
        {(items ?? []).map((t) => (
          <AdminCard key={t.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-white">{t.name}</p>
                <p className="text-sm text-glam-accent">{t.service}</p>
              </div>
              <span className="text-glam-accent">{"★".repeat(t.rating)}</span>
            </div>
            <p className="mt-3 text-sm italic text-white/70">&ldquo;{t.quote}&rdquo;</p>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
