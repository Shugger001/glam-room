import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { redirectWithFlash } from "@/lib/admin/flash-redirect";
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_ORDER } from "@/lib/constants/services";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { parseAdminServiceCreateForm, parseAdminServiceForm, slugifyServiceName } from "@/lib/validation/admin-service";
import {
  AdminBtnPrimary,
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminSetupNotice,
  adminFormRowClass,
} from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white";

async function updateService(formData: FormData) {
  "use server";
  await requireSuperAdmin();

  const parsed = parseAdminServiceForm(formData);
  if (!parsed.success) {
    redirectWithFlash("/admin/services", "error", "Could not save service. Check the form.");
  }

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
      location_ids: values.location_ids.length > 0 ? values.location_ids : null,
    })
    .eq("id", id);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/book");
  revalidatePath("/");
  redirectWithFlash("/admin/services", "success", "Service saved");
}

async function createService(formData: FormData) {
  "use server";
  await requireSuperAdmin();

  const parsed = parseAdminServiceCreateForm(formData);
  if (!parsed.success) {
    redirectWithFlash("/admin/services", "error", "Could not add service. Check the form.");
  }

  const admin = createAdminClient();
  const values = parsed.data;
  const baseSlug = slugifyServiceName(values.name) || "service";

  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await admin.from("services").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i + 2}`;
  }

  await admin.from("services").insert({
    name: values.name,
    description: values.description || null,
    duration_minutes: values.duration_minutes,
    base_price: values.base_price,
    currency: "GHS",
    category: values.category,
    sort_order: values.sort_order,
    featured: values.featured,
    active: values.active,
    location_ids: values.location_ids.length > 0 ? values.location_ids : null,
    slug,
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/book");
  revalidatePath("/");
  redirectWithFlash("/admin/services", "success", "Service added");
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
      "id, name, description, duration_minutes, base_price, category, sort_order, featured, active, location_ids",
    )
    .order("sort_order", { ascending: true });

  const categories = SERVICE_CATEGORY_ORDER.map((value) => [value, SERVICE_CATEGORIES[value]] as const);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Services"
        description="Edit pricing and shop availability. Leave shops unchecked for all locations — check Madina only for nails/makeup."
      />

      <AdminPanel className="!border-glam-accent/25 !bg-glam-accent/5">
      <form action={createService}>
        <p className="text-sm font-semibold text-glam-accent">Add new service</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="block text-xs text-white/55">
            Service name
            <input type="text" name="name" required placeholder="Silk Press" className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Category
            <select name="category" defaultValue="hair-reset" className={inputClass}>
              {categories.map(([value, label]) => (
                <option key={value} value={value} className="bg-glam-primary">
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-white/55 lg:col-span-2">
            Description
            <textarea name="description" rows={2} className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Duration (minutes)
            <input type="number" name="duration_minutes" min={15} step={15} defaultValue={60} required className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Price (GHS)
            <input type="number" name="base_price" min={0} step={1} defaultValue={50} required className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Sort order
            <input type="number" name="sort_order" min={0} defaultValue={(services?.length ?? 0) + 1} className={inputClass} />
          </label>
          <fieldset className="lg:col-span-2">
            <legend className="text-xs text-white/55">Available at shops</legend>
            <p className="mt-1 text-[0.7rem] text-white/40">Leave all unchecked = every shop</p>
            <div className="mt-2 flex flex-wrap gap-4">
              {SALON_LOCATIONS.map((loc) => (
                <label key={loc.id} className="flex items-center gap-2 text-sm text-white/75">
                  <input type="checkbox" name="location_ids" value={loc.id} />
                  {loc.area}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-end gap-6">
            <label className="flex items-center gap-2 text-sm text-white/75">
              <input type="checkbox" name="featured" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-white/75">
              <input type="checkbox" name="active" defaultChecked />
              Active
            </label>
          </div>
        </div>
        <div className="mt-5">
          <AdminBtnPrimary>Add service</AdminBtnPrimary>
        </div>
      </form>
      </AdminPanel>

      <div className="space-y-3">
        {(services ?? []).length === 0 ? (
          <AdminEmptyState
            title="No services yet"
            description="Add a service above to show it on the booking page."
          />
        ) : null}

        {(services ?? []).map((s) => (
          <form key={s.id} action={updateService} className="rounded-xl border border-white/10 bg-black/25 p-4">
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
              <fieldset className="lg:col-span-2">
                <legend className="text-xs text-white/55">Available at shops</legend>
                <p className="mt-1 text-[0.7rem] text-white/40">Leave all unchecked = every shop</p>
                <div className="mt-2 flex flex-wrap gap-4">
                  {SALON_LOCATIONS.map((loc) => {
                    const ids = Array.isArray(s.location_ids) ? (s.location_ids as string[]) : [];
                    return (
                      <label key={loc.id} className="flex items-center gap-2 text-sm text-white/75">
                        <input
                          type="checkbox"
                          name="location_ids"
                          value={loc.id}
                          defaultChecked={ids.includes(loc.id)}
                        />
                        {loc.area}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
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
                {Array.isArray(s.location_ids) && s.location_ids.length > 0
                  ? ` · ${SALON_LOCATIONS.filter((l) => (s.location_ids as string[]).includes(l.id))
                      .map((l) => l.area)
                      .join(", ")} only`
                  : " · All shops"}
              </p>
              <AdminBtnPrimary>Save service</AdminBtnPrimary>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
