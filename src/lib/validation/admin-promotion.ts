import { z } from "zod";

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function optionalNumber(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function optionalDate(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export const adminPromotionFieldsSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  code: z.string().trim().max(40).optional().or(z.literal("")),
  discount_percent: z.string().optional().or(z.literal("")),
  discount_amount: z.string().optional().or(z.literal("")),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
  active: z.coerce.boolean(),
});

export const adminPromotionUpdateSchema = adminPromotionFieldsSchema.extend({
  id: z.string().uuid(),
});

export function normalizePromotionForm(data: z.infer<typeof adminPromotionFieldsSchema>) {
  return {
    title: data.title,
    description: data.description || null,
    code: data.code || null,
    discount_percent: optionalNumber(data.discount_percent),
    discount_amount: optionalNumber(data.discount_amount),
    starts_at: optionalDate(data.starts_at),
    ends_at: optionalDate(data.ends_at),
    active: data.active,
  };
}

export function parseAdminPromotionCreateForm(formData: FormData) {
  return adminPromotionFieldsSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    code: formData.get("code") ?? "",
    discount_percent: formData.get("discount_percent") ?? "",
    discount_amount: formData.get("discount_amount") ?? "",
    starts_at: formData.get("starts_at") ?? "",
    ends_at: formData.get("ends_at") ?? "",
    active: readBoolean(formData, "active"),
  });
}

export function parseAdminPromotionUpdateForm(formData: FormData) {
  return adminPromotionUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    code: formData.get("code") ?? "",
    discount_percent: formData.get("discount_percent") ?? "",
    discount_amount: formData.get("discount_amount") ?? "",
    starts_at: formData.get("starts_at") ?? "",
    ends_at: formData.get("ends_at") ?? "",
    active: readBoolean(formData, "active"),
  });
}
