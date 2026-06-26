import Image from "next/image";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { GALLERY_CATEGORIES } from "@/lib/constants/gallery";
import { uploadGalleryImage } from "@/lib/storage/gallery-upload";
import {
  parseAdminGalleryCreateForm,
  parseAdminGalleryUpdateForm,
} from "@/lib/validation/admin-gallery";
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

function revalidateGalleryPaths() {
  revalidatePath("/admin/gallery");
  revalidatePath("/");
  revalidatePath("/gallery");
}

async function resolveImageSrc(formData: FormData, currentSrc?: string) {
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const admin = createAdminClient();
    const uploaded = await uploadGalleryImage(admin, file);
    if (!uploaded.ok) return { ok: false as const, error: uploaded.error };
    return { ok: true as const, src: uploaded.src };
  }

  const url = String(formData.get("src") ?? "").trim();
  if (url) return { ok: true as const, src: url };

  if (currentSrc) return { ok: true as const, src: currentSrc };

  return { ok: false as const, error: "Upload an image or paste an image URL." };
}

async function createGalleryItem(formData: FormData) {
  "use server";
  await requireSuperAdmin();

  const parsed = parseAdminGalleryCreateForm(formData);
  if (!parsed.success) return;

  const srcResult = await resolveImageSrc(formData);
  if (!srcResult.ok) return;

  const admin = createAdminClient();
  await admin.from("gallery").insert({
    src: srcResult.src,
    alt: parsed.data.alt,
    category: parsed.data.category,
    width: parsed.data.width,
    height: parsed.data.height,
    sort_order: parsed.data.sort_order,
    published: parsed.data.published,
  });

  revalidateGalleryPaths();
}

async function updateGalleryItem(formData: FormData) {
  "use server";
  await requireSuperAdmin();

  const parsed = parseAdminGalleryUpdateForm(formData);
  if (!parsed.success) return;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("gallery")
    .select("src")
    .eq("id", parsed.data.id)
    .maybeSingle();

  const srcResult = await resolveImageSrc(formData, existing?.src ?? undefined);
  if (!srcResult.ok) return;

  await admin
    .from("gallery")
    .update({
      src: srcResult.src,
      alt: parsed.data.alt,
      category: parsed.data.category,
      width: parsed.data.width,
      height: parsed.data.height,
      sort_order: parsed.data.sort_order,
      published: parsed.data.published,
    })
    .eq("id", parsed.data.id);

  revalidateGalleryPaths();
}

async function deleteGalleryItem(formData: FormData) {
  "use server";
  await requireSuperAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const admin = createAdminClient();
  await admin.from("gallery").delete().eq("id", id);
  revalidateGalleryPaths();
}

function GalleryThumb({ src, alt }: { src: string; alt: string }) {
  const isRemote = src.startsWith("http://") || src.startsWith("https://");

  return (
    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
      {isRemote ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Image src={src} alt={alt} fill className="object-cover" sizes="80px" />
      )}
    </div>
  );
}

export default async function AdminGalleryPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Gallery" />;
  }

  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data: items } = await admin
    .from("gallery")
    .select("id, src, alt, category, width, height, sort_order, published")
    .order("sort_order", { ascending: true });

  const categories = Object.entries(GALLERY_CATEGORIES);
  const nextSort = (items?.length ?? 0) + 1;

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Gallery</h1>
      <p className="mt-3 max-w-3xl text-sm text-white/55">
        Upload portfolio photos, set captions and categories, and control what appears on the
        homepage gallery. Images upload to Supabase Storage (
        <code className="text-glam-accent">site-media/gallery/</code>) or use an external URL.
      </p>

      <section className="mt-8 rounded-2xl border border-glam-accent/25 bg-glam-accent/5 p-5 sm:p-6">
        <h2 className="font-display text-xl text-white">Add image</h2>
        <form action={createGalleryItem} encType="multipart/form-data" className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="block text-xs text-white/55 lg:col-span-2">
            Upload image
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1 block w-full text-sm text-white/75 file:mr-4 file:rounded-full file:border-0 file:bg-glam-accent file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-glam-primary"
            />
          </label>
          <label className="block text-xs text-white/55 lg:col-span-2">
            Or image URL
            <input type="url" name="src" placeholder="https://..." className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Caption
            <input type="text" name="alt" required placeholder="Butterfly braids — Madina" className={inputClass} />
          </label>
          <label className="block text-xs text-white/55">
            Category
            <select name="category" defaultValue="hair" className={inputClass}>
              {categories.map(([value, label]) => (
                <option key={value} value={value} className="bg-glam-primary">
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-white/55">
            Sort order
            <input type="number" name="sort_order" min={0} defaultValue={nextSort} className={inputClass} />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm text-white/75">
            <input type="checkbox" name="published" defaultChecked />
            Published on website
          </label>
          <input type="hidden" name="width" value={800} />
          <input type="hidden" name="height" value={1000} />
          <div className="lg:col-span-2">
            <AdminBtnPrimary>Add to gallery</AdminBtnPrimary>
          </div>
        </form>
      </section>

      <div className="mt-8 space-y-4">
        <h2 className="font-display text-xl text-white">
          Portfolio ({items?.length ?? 0})
        </h2>

        {(items ?? []).length === 0 ? (
          <p className="text-sm text-white/55">No gallery images yet. Add your first photo above.</p>
        ) : null}

        {(items ?? []).map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <div className="flex flex-col gap-5 lg:flex-row">
              <GalleryThumb src={item.src} alt={item.alt} />
              <form
                action={updateGalleryItem}
                encType="multipart/form-data"
                className="min-w-0 flex-1 grid gap-4 sm:grid-cols-2"
              >
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="width" value={item.width ?? 800} />
                <input type="hidden" name="height" value={item.height ?? 1000} />

                <label className="block text-xs text-white/55 sm:col-span-2">
                  Replace image (optional)
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="mt-1 block w-full text-sm text-white/75 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                  />
                </label>
                <label className="block text-xs text-white/55 sm:col-span-2">
                  Or new image URL
                  <input
                    type="url"
                    name="src"
                    defaultValue={item.src.startsWith("http") ? item.src : ""}
                    placeholder={item.src.startsWith("http") ? item.src : "https://..."}
                    className={inputClass}
                  />
                  {!item.src.startsWith("http") ? (
                    <span className="mt-1 block text-xs text-white/40">Current: {item.src}</span>
                  ) : null}
                </label>
                <label className="block text-xs text-white/55">
                  Caption
                  <input type="text" name="alt" defaultValue={item.alt} required className={inputClass} />
                </label>
                <label className="block text-xs text-white/55">
                  Category
                  <select name="category" defaultValue={item.category} className={inputClass}>
                    {categories.map(([value, label]) => (
                      <option key={value} value={value} className="bg-glam-primary">
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-white/55">
                  Sort order
                  <input
                    type="number"
                    name="sort_order"
                    min={0}
                    defaultValue={item.sort_order ?? 0}
                    className={inputClass}
                  />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm text-white/75">
                  <input type="checkbox" name="published" defaultChecked={Boolean(item.published)} />
                  Published
                </label>

                <div className={`${adminFormRowClass} sm:col-span-2 border-none bg-transparent p-0 sm:grid-cols-[1fr_auto]`}>
                  <p className="text-xs text-white/45">
                    {item.published ? "Live on site" : "Hidden (draft)"} · order {item.sort_order}
                  </p>
                  <AdminBtnPrimary>Save</AdminBtnPrimary>
                </div>
              </form>
            </div>

            <form action={deleteGalleryItem} className="mt-4 flex justify-end border-t border-white/10 pt-4">
              <input type="hidden" name="id" value={item.id} />
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
