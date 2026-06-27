import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FaqItem } from "@/lib/constants/faqs";
import type { SalonLocation } from "@/lib/constants/locations";
import type { BookingTimeSlot, SalonConfig } from "@/lib/data/live-site-content";

const faqSchema = z.object({
  id: z.string().trim().min(1).max(40),
  question: z.string().trim().min(3).max(200),
  answer: z.string().trim().min(5).max(800),
});

const locationSchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(80),
  area: z.string().trim().min(1).max(80),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(1).max(80),
  country: z.string().trim().min(1).max(80),
  mapUrl: z.string().trim().url().or(z.literal("")),
  hours: z.string().trim().min(3).max(120),
  image: z.string().trim().min(1).max(300),
  badge: z.string().trim().max(40).optional().or(z.literal("")),
});

const salonConfigSchema = z.object({
  openHour: z.coerce.number().int().min(0).max(23),
  closeHour: z.coerce.number().int().min(1).max(24),
  hoursLabel: z.string().trim().min(3).max(120),
  braidsNotice: z.string().trim().min(10).max(500),
  bookingTimeSlots: z.array(
    z.object({
      value: z.string().regex(/^\d{2}:\d{2}$/),
      label: z.string().trim().min(3).max(40),
    }),
  ).min(1).max(12),
});

export function parseFaqsFromForm(formData: FormData): FaqItem[] {
  const raw = String(formData.get("faqs_json") ?? "[]");
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => faqSchema.safeParse(item))
      .filter((r) => r.success)
      .map((r) => r.data);
  } catch {
    return [];
  }
}

export function parseLocationsFromForm(formData: FormData): SalonLocation[] {
  const raw = String(formData.get("locations_json") ?? "[]");
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => locationSchema.safeParse(item))
      .filter((r) => r.success)
      .map((r) => ({
        ...r.data,
        badge: r.data.badge || undefined,
      }));
  } catch {
    return [];
  }
}

export function parseSalonConfigFromForm(formData: FormData): SalonConfig | null {
  const slotsRaw = String(formData.get("time_slots_json") ?? "[]");
  let bookingTimeSlots: BookingTimeSlot[] = [];
  try {
    const parsed = JSON.parse(slotsRaw) as unknown;
    if (Array.isArray(parsed)) bookingTimeSlots = parsed as BookingTimeSlot[];
  } catch {
    bookingTimeSlots = [];
  }

  const result = salonConfigSchema.safeParse({
    openHour: formData.get("open_hour"),
    closeHour: formData.get("close_hour"),
    hoursLabel: formData.get("hours_label"),
    braidsNotice: formData.get("braids_notice"),
    bookingTimeSlots,
  });

  return result.success ? result.data : null;
}
