import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { SERVICE_CATEGORIES } from "@/lib/constants/services";
import { parseAdminServiceForm } from "@/lib/validation/admin-service";
import {
  AdminBtnPrimary,
  adminFormRowClass,
  AdminPanel,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white";

async function updateService(formData: FormData) {
  "use server";
  await requireSuperAdmin();

  const parsed = parseAdminServiceForm(formData);
  if (!parsed.success) return;

  const admin = createAdminClient();
  const { id, ...values } = parsed.data;

  await admin
    .from("services")
    .update({
      name: values.name,
      description: values.description || null,
      duration_minutes: values.duration_minutes,
      base_price: values.base_price,
      currency: "GHS",
      category: values.category,
      sort_order: values.sort_order,
      featured: values.featured,
      active: values.active,
    })
    .eq("id", id);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/book");
  revalidatePath("/");
}

export default async function AdminServicesPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Services" />;
  }

  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data: services } = await admin
    .from("services")
    .select(
      "id, name, description, duration_minutes, base_price, category, sort_order, featured, active",
    )
    .order("sort_order", { ascending: true });

  const categories = Object.entries(SERVICE_CATEGORIES);

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Services</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Edit pricing, duration, categories, and visibility. Changes appear on the booking page
        immediately.
      </p>

      <div className="mt-6 space-y-4">
        {(services ?? []).length === 0 ? (
          <p className="text-sm text-white/55">No services found in Supabase.</p>
        ) : null}

        {(services ?? []).map((s) => (
          <form key={s.id} action={updateService} className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block text-xs text-white/55">
                Service name
                <input
                  type="text"
                  name="name"
                  defaultValue={s.name}
                  required
                  className={inputClass}
                />
              </label>
              <label className="block text-xs text-white/55">
                Category
                <select name="category" defaultValue={s.category ?? "hair-reset"} className={inputClass}>
                  {categories.map(([value, label]) => (
                    <option key={value} value={value} className="bg-glam-primary">
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-white/55 lg:col-span-2">
                Description
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={s.description ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="block text-xs text-white/55">
                Duration (minutes)
                <input
                  type="number"
                  name="duration_minutes"
                  min={15}
                  step={15}
                  defaultValue={s.duration_minutes}
                  required
                  className={inputClass}
                />
              </label>
              <label className="block text-xs text-white/55">
                Price (GHS)
                <input
                  type="number"
                  name="base_price"
                  min={0}
                  step={1}
                  defaultValue={Number(s.base_price)}
                  required
                  className={inputClass}
                />
              </label>
              <label className="block text-xs text-white/55">
                Sort order
                <input
                  type="number"
                  name="sort_order"
                  min={0}
                  defaultValue={s.sort_order ?? 0}
                  className={inputClass}
                />
              </label>
              <div className="flex flex-wrap items-end gap-6">
                <label className="flex items-center gap-2 text-sm text-white/75">
                  <input type="checkbox" name="featured" defaultChecked={Boolean(s.featured)} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-white/75">
                  <input type="checkbox" name="active" defaultChecked={Boolean(s.active)} />
                  Active
                </label>
              </div>
            </div>

            <input type="hidden" name="id" value={s.id} />

            <div className={`${adminFormRowClass} mt-5 border-none bg-transparent p-0 sm:grid-cols-[1fr_auto]`}>
              <p className="text-xs text-white/45">
                {s.active ? "Visible on website" : "Hidden from booking"} · ₵
                {Number(s.base_price).toLocaleString()} · {s.duration_minutes} min
              </p>
              <AdminBtnPrimary>Save service</AdminBtnPrimary>
            </div>
          </form>
        ))}
      </div>
    </AdminPanel>
  );
}
