import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/constants/brand";
import { FAQ_ITEMS, type FaqItem } from "@/lib/constants/faqs";
import { SALON_LOCATIONS, type SalonLocation } from "@/lib/constants/locations";
import { BOOKING_TIME_SLOTS } from "@/lib/validation/booking";

export type BookingTimeSlot = { readonly value: string; readonly label: string };

export type SalonConfig = {
  openHour: number;
  closeHour: number;
  hoursLabel: string;
  braidsNotice: string;
  bookingTimeSlots: BookingTimeSlot[];
};

const DEFAULT_SALON_CONFIG: SalonConfig = {
  openHour: 8,
  closeHour: 20,
  hoursLabel: "Mon to Sun: 8am to 8pm",
  braidsNotice: BRAND.copy.braidsNotice,
  bookingTimeSlots: [...BOOKING_TIME_SLOTS],
};

async function readSetting<T>(key: string): Promise<T | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data?.value) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

export async function getLiveFaqs(): Promise<FaqItem[]> {
  const stored = await readSetting<FaqItem[]>("faqs");
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.filter((f) => f.question?.trim() && f.answer?.trim());
  }
  return FAQ_ITEMS;
}

export async function getLiveLocations(): Promise<SalonLocation[]> {
  const stored = await readSetting<SalonLocation[]>("locations");
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.filter((l) => l.id && l.area);
  }
  return SALON_LOCATIONS;
}

export async function getLiveSalonConfig(): Promise<SalonConfig> {
  const stored = await readSetting<Partial<SalonConfig>>("salon_config");
  if (!stored || typeof stored !== "object") return DEFAULT_SALON_CONFIG;

  return {
    openHour: typeof stored.openHour === "number" ? stored.openHour : DEFAULT_SALON_CONFIG.openHour,
    closeHour:
      typeof stored.closeHour === "number" ? stored.closeHour : DEFAULT_SALON_CONFIG.closeHour,
    hoursLabel:
      typeof stored.hoursLabel === "string" && stored.hoursLabel.trim()
        ? stored.hoursLabel
        : DEFAULT_SALON_CONFIG.hoursLabel,
    braidsNotice:
      typeof stored.braidsNotice === "string" && stored.braidsNotice.trim()
        ? stored.braidsNotice
        : DEFAULT_SALON_CONFIG.braidsNotice,
    bookingTimeSlots:
      Array.isArray(stored.bookingTimeSlots) && stored.bookingTimeSlots.length > 0
        ? stored.bookingTimeSlots.filter((s) => s.value && s.label)
        : DEFAULT_SALON_CONFIG.bookingTimeSlots,
  };
}

export async function getLiveSiteContent() {
  const [faqs, locations, salonConfig] = await Promise.all([
    getLiveFaqs(),
    getLiveLocations(),
    getLiveSalonConfig(),
  ]);
  return { faqs, locations, salonConfig };
}

/** Sync helper for API routes — uses constants when DB unavailable. */
export function locationLabelFromList(locationId: string | null, locations = SALON_LOCATIONS) {
  if (!locationId) return null;
  return locations.find((l) => l.id === locationId)?.area ?? locationId;
}
