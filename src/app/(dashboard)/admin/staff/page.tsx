import Image from "next/image";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { uploadSiteMediaImage } from "@/lib/storage/gallery-upload";
import {
  parseAdminStaffCreateForm,
  parseAdminStaffUpdateForm,
  parseSpecialtyCsv,
} from "@/lib/validation/admin-staff";
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

function revalidateStaffPaths() {
  revalidatePath("/admin/staff");
  revalidatePath("/");
  revalidatePath("/experts");
  revalidatePath("/book");
}

async function resolveStaffImage(formData: FormData, current?: string | null) {
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const admin = createAdminClient();
    const uploaded = await uploadSiteMediaImage(admin, file, "staff");
    if (!uploaded.ok) return { ok: false as const, error: uploaded.error };
    return { ok: true as const, image_url: uploaded.src };
  }

  const url = String(formData.get("image_url") ?? "").trim();
  if (url) return { ok: true as const, image_url: url };
  if (current) return { ok: true as const, image_url: current };
  return { ok: true as const, image_url: null };
}

async function createStaffMember(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const parsed = parseAdminStaffCreateForm(formData);
  if (!parsed.success) return;

  const image = await resolveStaffImage(formData);
  if (!image.ok) return;

  const admin = createAdminClient();
  await admin.from("staff").insert({
    name: parsed.data.name,
    role: parsed.data.role,
    bio: parsed.data.bio || null,
    experience: parsed.data.experience || null,
    specialty: parseSpecialtyCsv(parsed.data.specialty ?? ""),
    image_url: image.image_url,
    instagram_url: parsed.data.instagram_url || null,
    sort_order: parsed.data.sort_order,
    active: parsed.data.active,
  });
  revalidateStaffPaths();
}

async function updateStaffMember(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const parsed = parseAdminStaffUpdateForm(formData);
  if (!parsed.success) return;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("staff")
    .select("image_url")
    .eq("id", parsed.data.id)
    .maybeSingle();

  const image = await resolveStaffImage(formData, existing?.image_url);
  if (!image.ok) return;

  await admin
    .from("staff")
    .update({
      name: parsed.data.name,
      role: parsed.data.role,
      bio: parsed.data.bio || null,
      experience: parsed.data.experience || null,
      specialty: parseSpecialtyCsv(parsed.data.specialty ?? ""),
      image_url: image.image_url,
      instagram_url: parsed.data.instagram_url || null,
      sort_order: parsed.data.sort_order,
      active: parsed.data.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);
  revalidateStaffPaths();
}

async function deleteStaffMember(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("staff").delete().eq("id", id);
  revalidateStaffPaths();
}

function StaffThumb({ src, name }: { src: string | null; name: string }) {
  if (!src) {
    return (
      <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-xs text-white/40">
        No photo
      </div>
    );
  }

  const isRemote = src.startsWith("http://") || src.startsWith("https://");
  return (
    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
      {isRemote ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <Image src={src} alt={name} fill className="object-cover" sizes="80px" />
      )}
    </div>
  );
}

export default async function AdminStaffPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Staff" />;
  }

  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data: staff } = await admin
    .from("staff")
    .select(
      "id, name, role, bio, experience, specialty, image_url, instagram_url, sort_order, active",
    )
    .order("sort_order", { ascending: true });

  const nextSort = (staff?.length ?? 0) + 1;

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Staff</h1>
      <p className="mt-3 max-w-3xl text-sm text-white/55">
        Manage stylist profiles on the Experts section and booking assignment. Specialties are
        comma-separated.
      </p>

      <section className="mt-8 rounded-2xl border border-glam-accent/25 bg-glam-accent/5 p-5 sm:p-6">
        <h2 className="font-display text-xl">Add team member</h2>
        <form action={createStaffMember} encType="multipart/form-data" className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-white/55">
            Name
            <input type="text" name="name" required className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Role
            <input type="text" name="role" required placeholder="Lead Stylist" className={inputClass} />
          </label>
          <label className="block text-xs text-white/55 sm:col-span-2">
            Bio
            <textarea name="bio" rows={2} className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Experience line
            <input type="text" name="experience" placeholder="10+ years" className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Specialties <span className="text-white/35">comma-separated</span>
            <input type="text" name="specialty" placeholder="Braids, Silk Press" className={inputClass} />
          </label>
          <label className="block text-xs text-white/55 sm:col-span-2">
            Upload photo
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1 block w-full text-sm text-white/75 file:mr-4 file:rounded-full file:border-0 file:bg-glam-accent file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:text-glam-primary"
            />
          </label>
          <label className="block text-xs text-white/55 sm:col-span-2">
            Or photo URL
            <input type="url" name="image_url" placeholder="https://..." className={inputClass} />
          </label>
          <label className="block text-xs text-white/55 sm:col-span-2">
            Instagram URL
            <input type="url" name="instagram_url" placeholder="https://instagram.com/..." className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Sort order
            <input type="number" name="sort_order" min={0} defaultValue={nextSort} className={inputClass} />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm text-white/75">
            <input type="checkbox" name="active" defaultChecked />
            Active on website
          </label>
          <div className="sm:col-span-2">
            <AdminBtnPrimary>Add staff</AdminBtnPrimary>
          </div>
        </form>
      </section>

      <div className="mt-8 space-y-4">
        {(staff ?? []).map((s) => {
          const specialty = Array.isArray(s.specialty) ? (s.specialty as string[]).join(", ") : "";
          return (
            <div key={s.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-col gap-5 lg:flex-row">
                <StaffThumb src={s.image_url} name={s.name} />
                <form
                  action={updateStaffMember}
                  encType="multipart/form-data"
                  className="min-w-0 flex-1 grid gap-4 sm:grid-cols-2"
                >
                  <input type="hidden" name="id" value={s.id} />
                  <label className="block text-xs text-white/55">
                    Name
                    <input type="text" name="name" defaultValue={s.name} required className={inputClass} />
                  </label>
                  <label className="block text-xs text-white/55">
                    Role
                    <input type="text" name="role" defaultValue={s.role} required className={inputClass} />
                  </label>
                  <label className="block text-xs text-white/55 sm:col-span-2">
                    Bio
                    <textarea name="bio" rows={2} defaultValue={s.bio ?? ""} className={inputClass} />
                  </label>
                  <label className="block text-xs text-white/55">
                    Experience
                    <input type="text" name="experience" defaultValue={s.experience ?? ""} className={inputClass} />
                  </label>
                  <label className="block text-xs text-white/55">
                    Specialties
                    <input type="text" name="specialty" defaultValue={specialty} className={inputClass} />
                  </label>
                  <label className="block text-xs text-white/55 sm:col-span-2">
                    Replace photo
                    <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-1 block w-full text-sm text-white/75 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white" />
                  </label>
                  <label className="block text-xs text-white/55 sm:col-span-2">
                    Photo URL
                    <input
                      type="url"
                      name="image_url"
                      defaultValue={s.image_url?.startsWith("http") ? s.image_url : ""}
                      className={inputClass}
                    />
                    {s.image_url && !s.image_url.startsWith("http") ? (
                      <span className="mt-1 block text-xs text-white/40">Current: {s.image_url}</span>
                    ) : null}
                  </label>
                  <label className="block text-xs text-white/55 sm:col-span-2">
                    Instagram
                    <input type="url" name="instagram_url" defaultValue={s.instagram_url ?? ""} className={inputClass} />
                  </label>
                  <label className="block text-xs text-white/55">
                    Sort order
                    <input type="number" name="sort_order" min={0} defaultValue={s.sort_order ?? 0} className={inputClass} />
                  </label>
                  <label className="flex items-end gap-2 pb-2 text-sm text-white/75">
                    <input type="checkbox" name="active" defaultChecked={Boolean(s.active)} />
                    Active
                  </label>
                  <div className={`${adminFormRowClass} sm:col-span-2 border-none bg-transparent p-0 sm:grid-cols-[1fr_auto]`}>
                    <p className="text-xs text-white/45">{s.active ? "Visible on site" : "Hidden"}</p>
                    <AdminBtnPrimary>Save</AdminBtnPrimary>
                  </div>
                </form>
              </div>
              <form action={deleteStaffMember} className="mt-4 flex justify-end border-t border-white/10 pt-4">
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" className={adminBtnOutline}>
                  Remove
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </AdminPanel>
  );
}
