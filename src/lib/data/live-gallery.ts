import { createClient } from "@/lib/supabase/server";
import { GALLERY_ITEMS, type GalleryCategory, type GalleryItem } from "@/lib/constants/gallery";

const GALLERY_CATEGORIES = new Set<string>(["hair", "wigs", "bridal", "transformation", "braids"]);

function isGalleryCategory(value: string): value is GalleryCategory {
  return GALLERY_CATEGORIES.has(value);
}

function mapGalleryRow(row: Record<string, unknown>): GalleryItem | null {
  const id = typeof row.id === "string" ? row.id : null;
  const src = typeof row.src === "string" ? row.src : null;
  const alt = typeof row.alt === "string" ? row.alt : null;
  const categoryRaw = typeof row.category === "string" ? row.category : "hair";
  const category = isGalleryCategory(categoryRaw) ? categoryRaw : "hair";
  const width = typeof row.width === "number" ? row.width : Number(row.width) || 800;
  const height = typeof row.height === "number" ? row.height : Number(row.height) || 800;

  if (!id || !src || !alt) return null;
  return { id, src, alt, category, width, height };
}

export async function getLiveGallery(): Promise<GalleryItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gallery")
      .select("id, src, alt, category, width, height, sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return GALLERY_ITEMS;
    const normalized = data
      .map((row) => mapGalleryRow(row as Record<string, unknown>))
      .filter((x): x is GalleryItem => Boolean(x));
    return normalized.length > 0 ? normalized : GALLERY_ITEMS;
  } catch {
    return GALLERY_ITEMS;
  }
}
