import { z } from "zod";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/constants/gallery";

const categoryKeys = Object.keys(GALLERY_CATEGORIES) as [GalleryCategory, ...GalleryCategory[]];

export const adminGalleryFieldsSchema = z.object({
  alt: z.string().trim().min(2, "Caption is required").max(160),
  category: z.enum(categoryKeys),
  sort_order: z.coerce.number().int().min(0).max(999),
  width: z.coerce.number().int().min(400).max(2400).default(800),
  height: z.coerce.number().int().min(400).max(3200).default(1000),
  published: z.coerce.boolean(),
  src: z.string().trim().url("Enter a valid image URL").optional().or(z.literal("")),
});

export const adminGalleryUpdateSchema = adminGalleryFieldsSchema.extend({
  id: z.string().uuid(),
});

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function parseAdminGalleryUpdateForm(formData: FormData) {
  return adminGalleryUpdateSchema.safeParse({
    id: formData.get("id"),
    alt: formData.get("alt"),
    category: formData.get("category"),
    sort_order: formData.get("sort_order"),
    width: formData.get("width"),
    height: formData.get("height"),
    published: readBoolean(formData, "published"),
    src: formData.get("src") ?? "",
  });
}

export function parseAdminGalleryCreateForm(formData: FormData) {
  return adminGalleryFieldsSchema.safeParse({
    alt: formData.get("alt"),
    category: formData.get("category"),
    sort_order: formData.get("sort_order"),
    width: formData.get("width"),
    height: formData.get("height"),
    published: readBoolean(formData, "published"),
    src: formData.get("src") ?? "",
  });
}
