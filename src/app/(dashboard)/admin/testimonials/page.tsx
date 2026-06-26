import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPanel, AdminSetupNotice } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Testimonials" />;
  }
  const admin = createAdminClient();
  const { data: items } = await admin
    .from("testimonials")
    .select("id, name, service, rating, quote, published")
    .order("sort_order", { ascending: true });

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Testimonials</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Manage client reviews and ratings.
      </p>
      <div className="mt-6 space-y-4">
        {(items ?? []).map((t) => (
          <div key={t.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-white">{t.name}</p>
                <p className="text-sm text-glam-accent">{t.service}</p>
              </div>
              <span className="text-glam-accent">{"★".repeat(t.rating)}</span>
            </div>
            <p className="mt-3 text-sm italic text-white/70">&ldquo;{t.quote}&rdquo;</p>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
