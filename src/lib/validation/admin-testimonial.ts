import { z } from "zod";

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export const adminTestimonialFieldsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  service: z.string().trim().max(80).optional().or(z.literal("")),
  quote: z.string().trim().min(10).max(600),
  rating: z.coerce.number().int().min(1).max(5),
  image_url: z.string().trim().url().optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).max(999),
  published: z.coerce.boolean(),
});

export const adminTestimonialUpdateSchema = adminTestimonialFieldsSchema.extend({
  id: z.string().uuid(),
});

export function parseAdminTestimonialCreateForm(formData: FormData) {
  return adminTestimonialFieldsSchema.safeParse({
    name: formData.get("name"),
    service: formData.get("service") ?? "",
    quote: formData.get("quote"),
    rating: formData.get("rating"),
    image_url: formData.get("image_url") ?? "",
    sort_order: formData.get("sort_order"),
    published: readBoolean(formData, "published"),
  });
}

export function parseAdminTestimonialUpdateForm(formData: FormData) {
  return adminTestimonialUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    service: formData.get("service") ?? "",
    quote: formData.get("quote"),
    rating: formData.get("rating"),
    image_url: formData.get("image_url") ?? "",
    sort_order: formData.get("sort_order"),
    published: readBoolean(formData, "published"),
  });
}
