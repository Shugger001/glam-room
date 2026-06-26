import { createClient } from "@/lib/supabase/server";
import {
  SALON_SERVICES,
  type SalonService,
  type ServiceCategory,
} from "@/lib/constants/services";

export type LiveService = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

const SERVICE_CATEGORIES = new Set<string>([
  "hair-styling",
  "wig-installation",
  "wig-revamp",
  "hair-coloring",
  "hair-treatment",
  "braids",
  "makeup",
  "lashes",
  "bridal",
]);

function isServiceCategory(value: string): value is ServiceCategory {
  return SERVICE_CATEGORIES.has(value);
}

function mapServiceRow(row: Record<string, unknown>): SalonService | null {
  const id = typeof row.id === "string" ? row.id : null;
  const name = typeof row.name === "string" ? row.name : null;
  const description = typeof row.description === "string" ? row.description : "";
  const slug = typeof row.slug === "string" ? row.slug : id ?? "service";
  const categoryRaw = typeof row.category === "string" ? row.category : "makeup";
  const category = isServiceCategory(categoryRaw) ? categoryRaw : "makeup";
  const duration =
    typeof row.duration_minutes === "number"
      ? row.duration_minutes
      : Number(row.duration_minutes);
  const price = typeof row.base_price === "number" ? row.base_price : Number(row.base_price);
  const image =
    typeof row.image_url === "string" && row.image_url.length > 0
      ? row.image_url
      : "https://images.unsplash.com/photo-1560066984-138d9834a973?w=800&q=80";
  const featured = row.featured === true;

  if (!id || !name || Number.isNaN(duration) || Number.isNaN(price)) return null;

  return {
    id,
    slug,
    name,
    description,
    category,
    durationMinutes: duration,
    price,
    image,
    featured,
  };
}

export async function getSalonServices(): Promise<SalonService[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select(
        "id, name, description, duration_minutes, base_price, category, slug, image_url, featured, active, sort_order",
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return SALON_SERVICES;
    const normalized = data
      .map((row) => mapServiceRow(row as Record<string, unknown>))
      .filter((x): x is SalonService => Boolean(x));
    return normalized.length > 0 ? normalized : SALON_SERVICES;
  } catch {
    return SALON_SERVICES;
  }
}

export async function getLiveServices(): Promise<LiveService[]> {
  const services = await getSalonServices();
  return services.map((s) => ({
    id: s.id,
    name: s.name,
    duration: s.durationMinutes,
    price: s.price,
  }));
}
