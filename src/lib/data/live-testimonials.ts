import { createClient } from "@/lib/supabase/server";
import { TESTIMONIALS, type Testimonial } from "@/lib/constants/testimonials";

function mapTestimonialRow(row: Record<string, unknown>): Testimonial | null {
  const id = typeof row.id === "string" ? row.id : null;
  const name = typeof row.name === "string" ? row.name : null;
  const service = typeof row.service === "string" ? row.service : "";
  const rating = typeof row.rating === "number" ? row.rating : Number(row.rating);
  const quote = typeof row.quote === "string" ? row.quote : null;
  const image =
    typeof row.image_url === "string" && row.image_url.length > 0 ? row.image_url : undefined;

  if (!id || !name || !quote || Number.isNaN(rating)) return null;
  return { id, name, service, rating, quote, image };
}

export async function getLiveTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, name, service, rating, quote, image_url, sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return TESTIMONIALS;
    const normalized = data
      .map((row) => mapTestimonialRow(row as Record<string, unknown>))
      .filter((x): x is Testimonial => Boolean(x));
    return normalized.length > 0 ? normalized : TESTIMONIALS;
  } catch {
    return TESTIMONIALS;
  }
}
