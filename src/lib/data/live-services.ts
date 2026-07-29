import { createClient } from "@/lib/supabase/server";
import {
  SALON_SERVICES,
  SERVICE_CATEGORY_ORDER,
  isServiceCategory,
  type SalonService,
  type ServiceCategory,
} from "@/lib/constants/services";

export type LiveService = {
  id: string;
  name: string;
  duration: number;
  price: number;
};

function mapServiceRow(
  row: Record<string, unknown>,
): (SalonService & { sortOrder: number }) | null {
  const id = typeof row.id === "string" ? row.id : null;
  const name = typeof row.name === "string" ? row.name : null;
  const description = typeof row.description === "string" ? row.description : "";
  const slug = typeof row.slug === "string" ? row.slug : id ?? "service";
  const categoryRaw = typeof row.category === "string" ? row.category : "hair-reset";
  const category = isServiceCategory(categoryRaw) ? categoryRaw : "hair-reset";
  const duration =
    typeof row.duration_minutes === "number"
      ? row.duration_minutes
      : Number(row.duration_minutes);
  const price = typeof row.base_price === "number" ? row.base_price : Number(row.base_price);
  const image =
    typeof row.image_url === "string" && row.image_url.length > 0
      ? row.image_url
      : "/images/glam-braids-studio.png";
  const featured = row.featured === true;
  const sortOrder =
    typeof row.sort_order === "number" ? row.sort_order : Number(row.sort_order) || 0;
  const locationIds = Array.isArray(row.location_ids)
    ? (row.location_ids as unknown[]).filter((v): v is string => typeof v === "string")
    : null;

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
    locationIds: locationIds && locationIds.length > 0 ? locationIds : null,
    sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
  };
}

function categoryRank(category: ServiceCategory) {
  const index = SERVICE_CATEGORY_ORDER.indexOf(category);
  return index === -1 ? 99 : index;
}

export async function getSalonServices(): Promise<SalonService[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select(
        "id, name, description, duration_minutes, base_price, category, slug, image_url, featured, active, sort_order, location_ids",
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return SALON_SERVICES;
    const normalized = data
      .map((row) => mapServiceRow(row as Record<string, unknown>))
      .filter((x): x is SalonService & { sortOrder: number } => Boolean(x));
    if (normalized.length === 0) return SALON_SERVICES;
    return [...normalized]
      .sort((a, b) => {
        const byCat = categoryRank(a.category) - categoryRank(b.category);
        if (byCat !== 0) return byCat;
        return a.sortOrder - b.sortOrder;
      })
      .map(({ sortOrder: _sortOrder, ...service }) => service);
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

export async function getSalonServiceBySlug(slug: string): Promise<SalonService | null> {
  const services = await getSalonServices();
  return services.find((service) => service.slug === slug) ?? null;
}

export async function getSalonServiceSlugs(): Promise<string[]> {
  const services = await getSalonServices();
  return services.map((service) => service.slug).filter(Boolean);
}
