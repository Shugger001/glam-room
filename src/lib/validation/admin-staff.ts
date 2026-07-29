import { z } from "zod";

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function parseSpecialtyCsv(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export const adminStaffFieldsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(800).optional().or(z.literal("")),
  experience: z.string().trim().max(120).optional().or(z.literal("")),
  specialty: z.string().trim().max(400).optional().or(z.literal("")),
  image_url: z.string().trim().url().optional().or(z.literal("")),
  instagram_url: z.string().trim().url().optional().or(z.literal("")),
  home_location_id: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) =>
        !v ||
        v === "glam-room-adenta" ||
        v === "glam-room-sowutuom" ||
        v === "glam-room-madina",
      "Invalid shop",
    ),
  is_front_desk: z.coerce.boolean(),
  sort_order: z.coerce.number().int().min(0).max(999),
  active: z.coerce.boolean(),
}).refine((data) => !data.is_front_desk || Boolean(data.home_location_id), {
  message: "Front desk seats need a home shop",
  path: ["home_location_id"],
});

export const adminStaffUpdateSchema = adminStaffFieldsSchema.extend({
  id: z.string().uuid(),
});

export function parseAdminStaffCreateForm(formData: FormData) {
  return adminStaffFieldsSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    bio: formData.get("bio") ?? "",
    experience: formData.get("experience") ?? "",
    specialty: formData.get("specialty") ?? "",
    image_url: formData.get("image_url") ?? "",
    instagram_url: formData.get("instagram_url") ?? "",
    home_location_id: formData.get("home_location_id") ?? "",
    is_front_desk: readBoolean(formData, "is_front_desk"),
    sort_order: formData.get("sort_order"),
    active: readBoolean(formData, "active"),
  });
}

export function parseAdminStaffUpdateForm(formData: FormData) {
  return adminStaffUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    role: formData.get("role"),
    bio: formData.get("bio") ?? "",
    experience: formData.get("experience") ?? "",
    specialty: formData.get("specialty") ?? "",
    image_url: formData.get("image_url") ?? "",
    instagram_url: formData.get("instagram_url") ?? "",
    home_location_id: formData.get("home_location_id") ?? "",
    is_front_desk: readBoolean(formData, "is_front_desk"),
    sort_order: formData.get("sort_order"),
    active: readBoolean(formData, "active"),
  });
}
