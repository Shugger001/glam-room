import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function tableCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "services" | "staff" | "gallery" | "testimonials",
  filter: Record<string, boolean>,
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filter)) {
    query = query.eq(key, value);
  }
  const { count, error } = await query;
  return { count: count ?? 0, error: error?.message ?? null };
}

export async function GET() {
  const base = {
    ok: true,
    brand: "The Glam Room",
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    deployedAt: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const [services, staff, gallery, testimonials] = await Promise.all([
      tableCount(supabase, "services", { active: true }),
      tableCount(supabase, "staff", { active: true }),
      tableCount(supabase, "gallery", { published: true }),
      tableCount(supabase, "testimonials", { published: true }),
    ]);

    const errors = [services, staff, gallery, testimonials]
      .map((r) => r.error)
      .filter(Boolean);

    if (errors.length > 0) {
      return NextResponse.json(
        {
          ...base,
          supabase: false,
          error: errors[0],
          hint: "Run migrations 00006 through 00009, then refresh.",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const counts = {
      services: services.count,
      staff: staff.count,
      gallery: gallery.count,
      testimonials: testimonials.count,
    };

    return NextResponse.json(
      {
        ...base,
        supabase: true,
        counts,
        seeded:
          counts.services >= 15 &&
          counts.staff >= 1 &&
          counts.gallery >= 9 &&
          counts.testimonials >= 4,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        ...base,
        supabase: false,
        error: "Supabase not configured in environment.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
