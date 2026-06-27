import { z } from "zod";
import { SERVICE_CATEGORIES, type ServiceCategory } from "@/lib/constants/services";

const categoryKeys = Object.keys(SERVICE_CATEGORIES) as [ServiceCategory, ...ServiceCategory[]];

export const adminServiceUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2, "Name is required").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  duration_minutes: z.coerce.number().int().min(15).max(480),
  base_price: z.coerce.number().min(0).max(1_000_000),
  category: z.enum(categoryKeys),
  sort_order: z.coerce.number().int().min(0).max(999),
  featured: z.coerce.boolean(),
  active: z.coerce.boolean(),
});

export const adminServiceCreateSchema = adminServiceUpdateSchema.omit({ id: true });

export type AdminServiceUpdateInput = z.infer<typeof adminServiceUpdateSchema>;
export type AdminServiceCreateInput = z.infer<typeof adminServiceCreateSchema>;

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function slugifyServiceName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function parseAdminServiceForm(formData: FormData) {
  return adminServiceUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    duration_minutes: formData.get("duration_minutes"),
    base_price: formData.get("base_price"),
    category: formData.get("category"),
    sort_order: formData.get("sort_order"),
    featured: readBoolean(formData, "featured"),
    active: readBoolean(formData, "active"),
  });
}

export function parseAdminServiceCreateForm(formData: FormData) {
  return adminServiceCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    duration_minutes: formData.get("duration_minutes"),
    base_price: formData.get("base_price"),
    category: formData.get("category"),
    sort_order: formData.get("sort_order"),
    featured: readBoolean(formData, "featured"),
    active: readBoolean(formData, "active"),
  });
}
