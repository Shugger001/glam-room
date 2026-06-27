import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import {
  parseAdminTestimonialCreateForm,
  parseAdminTestimonialUpdateForm,
} from "@/lib/validation/admin-testimonial";
import {
  AdminBtnPrimary,
  adminBtnOutline,
  adminFormRowClass,
  AdminPanel,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white";

function revalidateTestimonialPaths() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  revalidatePath("/testimonials");
}

async function createTestimonial(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const parsed = parseAdminTestimonialCreateForm(formData);
  if (!parsed.success) return;

  const admin = createAdminClient();
  await admin.from("testimonials").insert({
    name: parsed.data.name,
    service: parsed.data.service || null,
    quote: parsed.data.quote,
    rating: parsed.data.rating,
    image_url: parsed.data.image_url || null,
    sort_order: parsed.data.sort_order,
    published: parsed.data.published,
  });
  revalidateTestimonialPaths();
}

async function updateTestimonial(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const parsed = parseAdminTestimonialUpdateForm(formData);
  if (!parsed.success) return;

  const admin = createAdminClient();
  await admin
    .from("testimonials")
    .update({
      name: parsed.data.name,
      service: parsed.data.service || null,
      quote: parsed.data.quote,
      rating: parsed.data.rating,
      image_url: parsed.data.image_url || null,
      sort_order: parsed.data.sort_order,
      published: parsed.data.published,
    })
    .eq("id", parsed.data.id);
  revalidateTestimonialPaths();
}

async function approveTestimonial(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("testimonials").update({ published: true }).eq("id", id);
  revalidateTestimonialPaths();
}

async function deleteTestimonial(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("testimonials").delete().eq("id", id);
  revalidateTestimonialPaths();
}

export default async function AdminTestimonialsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Testimonials" />;
  }

  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data: items } = await admin
    .from("testimonials")
    .select("id, name, service, rating, quote, image_url, sort_order, published, source, booking_id")
    .order("sort_order", { ascending: true });

  const pending = (items ?? []).filter((t) => !t.published && t.source === "client");
  const published = (items ?? []).filter((t) => t.published || t.source !== "client");

  const nextSort = (items?.length ?? 0) + 1;

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Testimonials</h1>
      <p className="mt-3 max-w-3xl text-sm text-white/55">
        Add and edit client reviews shown on the homepage. Lower sort order appears first.
      </p>

      <section className="mt-8 rounded-2xl border border-glam-accent/25 bg-glam-accent/5 p-5 sm:p-6">
        <h2 className="font-display text-xl">Add testimonial</h2>
        <form action={createTestimonial} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-white/55">
            Client name
            <input type="text" name="name" required className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Label <span className="text-white/35">(e.g. Regular Client)</span>
            <input type="text" name="service" className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Rating
            <select name="rating" defaultValue={5} className={inputClass}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n} className="bg-glam-primary">
                  {n} stars
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-white/55">
            Sort order
            <input type="number" name="sort_order" min={0} defaultValue={nextSort} className={inputClass} />
          </label>
          <label className="block text-xs text-white/55 sm:col-span-2">
            Quote
            <textarea name="quote" rows={3} required className={inputClass} />
          </label>
          <label className="block text-xs text-white/55 sm:col-span-2">
            Photo URL <span className="text-white/35">optional</span>
            <input type="url" name="image_url" placeholder="https://..." className={inputClass} />
          </label>
          <label className="flex items-center gap-2 text-sm text-white/75 sm:col-span-2">
            <input type="checkbox" name="published" defaultChecked />
            Published on website
          </label>
          <div className="sm:col-span-2">
            <AdminBtnPrimary>Add testimonial</AdminBtnPrimary>
          </div>
        </form>
      </section>

      {pending.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
          <h2 className="font-display text-xl text-amber-100">Pending client reviews ({pending.length})</h2>
          <p className="mt-2 text-sm text-white/55">
            Submitted after appointments via SMS review links. Approve to publish on the website.
          </p>
          <div className="mt-4 space-y-4">
            {pending.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-white">
                  {t.name} · {"★".repeat(t.rating)} · {t.service}
                </p>
                <p className="mt-2 text-sm italic text-white/70">&ldquo;{t.quote}&rdquo;</p>
                <form action={approveTestimonial} className="mt-4 flex gap-3">
                  <input type="hidden" name="id" value={t.id} />
                  <AdminBtnPrimary>Approve & publish</AdminBtnPrimary>
                </form>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8 space-y-4">
        {(published ?? []).map((t) => (
          <div key={t.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <form action={updateTestimonial} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={t.id} />
              <label className="block text-xs text-white/55">
                Client name
                <input type="text" name="name" defaultValue={t.name} required className={inputClass} />
              </label>
              <label className="block text-xs text-white/55">
                Label
                <input type="text" name="service" defaultValue={t.service ?? ""} className={inputClass} />
              </label>
              <label className="block text-xs text-white/55">
                Rating
                <select name="rating" defaultValue={t.rating} className={inputClass}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n} className="bg-glam-primary">
                      {n} stars
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-white/55">
                Sort order
                <input type="number" name="sort_order" min={0} defaultValue={t.sort_order ?? 0} className={inputClass} />
              </label>
              <label className="block text-xs text-white/55 sm:col-span-2">
                Quote
                <textarea name="quote" rows={3} defaultValue={t.quote} required className={inputClass} />
              </label>
              <label className="block text-xs text-white/55 sm:col-span-2">
                Photo URL
                <input type="url" name="image_url" defaultValue={t.image_url ?? ""} className={inputClass} />
              </label>
              <label className="flex items-center gap-2 text-sm text-white/75 sm:col-span-2">
                <input type="checkbox" name="published" defaultChecked={Boolean(t.published)} />
                Published
              </label>
              <div className={`${adminFormRowClass} sm:col-span-2 border-none bg-transparent p-0 sm:grid-cols-[1fr_auto]`}>
                <p className="text-xs text-white/45">
                  {t.published ? "Live on site" : "Draft"} · {"★".repeat(t.rating)}
                </p>
                <AdminBtnPrimary>Save</AdminBtnPrimary>
              </div>
            </form>
            <form action={deleteTestimonial} className="mt-4 flex justify-end border-t border-white/10 pt-4">
              <input type="hidden" name="id" value={t.id} />
              <button type="submit" className={adminBtnOutline}>
                Remove
              </button>
            </form>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
