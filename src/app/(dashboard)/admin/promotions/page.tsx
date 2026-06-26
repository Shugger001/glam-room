import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import {
  normalizePromotionForm,
  parseAdminPromotionCreateForm,
  parseAdminPromotionUpdateForm,
} from "@/lib/validation/admin-promotion";
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

function revalidatePromotionPaths() {
  revalidatePath("/admin/promotions");
}

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

async function createPromotion(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const parsed = parseAdminPromotionCreateForm(formData);
  if (!parsed.success) return;

  const admin = createAdminClient();
  await admin.from("promotions").insert(normalizePromotionForm(parsed.data));
  revalidatePromotionPaths();
}

async function updatePromotion(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const parsed = parseAdminPromotionUpdateForm(formData);
  if (!parsed.success) return;

  const { id, ...fields } = parsed.data;
  const values = normalizePromotionForm(fields);
  const admin = createAdminClient();
  await admin.from("promotions").update(values).eq("id", id);
  revalidatePromotionPaths();
}

async function deletePromotion(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("promotions").delete().eq("id", id);
  revalidatePromotionPaths();
}

export default async function AdminPromotionsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Promotions" />;
  }

  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data: promos } = await admin
    .from("promotions")
    .select("id, title, description, code, discount_percent, discount_amount, active, starts_at, ends_at")
    .order("created_at", { ascending: false });

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Promotions</h1>
      <p className="mt-3 max-w-3xl text-sm text-white/55">
        Create discount codes and seasonal offers for future checkout campaigns.
      </p>

      <section className="mt-8 rounded-2xl border border-glam-accent/25 bg-glam-accent/5 p-5 sm:p-6">
        <h2 className="font-display text-xl">Add promotion</h2>
        <form action={createPromotion} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-white/55 sm:col-span-2">
            Title
            <input type="text" name="title" required className={inputClass} />
          </label>
          <label className="block text-xs text-white/55 sm:col-span-2">
            Description
            <textarea name="description" rows={2} className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Promo code
            <input type="text" name="code" placeholder="GLAM10" className={inputClass} />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm text-white/75">
            <input type="checkbox" name="active" defaultChecked />
            Active
          </label>
          <label className="block text-xs text-white/55">
            Discount %
            <input type="number" name="discount_percent" min={0} max={100} step={1} className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Discount amount (GHS)
            <input type="number" name="discount_amount" min={0} step={1} className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Starts
            <input type="datetime-local" name="starts_at" className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Ends
            <input type="datetime-local" name="ends_at" className={inputClass} />
          </label>
          <div className="sm:col-span-2">
            <AdminBtnPrimary>Add promotion</AdminBtnPrimary>
          </div>
        </form>
      </section>

      <div className="mt-8 space-y-4">
        {(promos ?? []).length === 0 ? (
          <p className="text-sm text-white/55">No promotions yet.</p>
        ) : null}
        {(promos ?? []).map((p) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <form action={updatePromotion} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={p.id} />
              <label className="block text-xs text-white/55 sm:col-span-2">
                Title
                <input type="text" name="title" defaultValue={p.title} required className={inputClass} />
              </label>
              <label className="block text-xs text-white/55 sm:col-span-2">
                Description
                <textarea name="description" rows={2} defaultValue={p.description ?? ""} className={inputClass} />
              </label>
              <label className="block text-xs text-white/55">
                Promo code
                <input type="text" name="code" defaultValue={p.code ?? ""} className={inputClass} />
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm text-white/75">
                <input type="checkbox" name="active" defaultChecked={Boolean(p.active)} />
                Active
              </label>
              <label className="block text-xs text-white/55">
                Discount %
                <input
                  type="number"
                  name="discount_percent"
                  min={0}
                  max={100}
                  defaultValue={p.discount_percent ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="block text-xs text-white/55">
                Discount amount (GHS)
                <input
                  type="number"
                  name="discount_amount"
                  min={0}
                  defaultValue={p.discount_amount ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="block text-xs text-white/55">
                Starts
                <input
                  type="datetime-local"
                  name="starts_at"
                  defaultValue={toDatetimeLocal(p.starts_at)}
                  className={inputClass}
                />
              </label>
              <label className="block text-xs text-white/55">
                Ends
                <input
                  type="datetime-local"
                  name="ends_at"
                  defaultValue={toDatetimeLocal(p.ends_at)}
                  className={inputClass}
                />
              </label>
              <div className={`${adminFormRowClass} sm:col-span-2 border-none bg-transparent p-0 sm:grid-cols-[1fr_auto]`}>
                <p className="text-xs text-white/45">
                  {p.active ? "Active" : "Inactive"}
                  {p.code ? ` · ${p.code}` : ""}
                </p>
                <AdminBtnPrimary>Save</AdminBtnPrimary>
              </div>
            </form>
            <form action={deletePromotion} className="mt-4 flex justify-end border-t border-white/10 pt-4">
              <input type="hidden" name="id" value={p.id} />
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
