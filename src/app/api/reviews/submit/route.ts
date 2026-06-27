import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const submitSchema = z.object({
  token: z.string().trim().min(8).max(80),
  quote: z.string().trim().min(10, "Please share at least a sentence.").max(600),
  rating: z.coerce.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`review-submit:${ip}`, 6, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review." },
      { status: 400 },
    );
  }

  const { token, quote, rating } = parsed.data;

  try {
    const admin = createAdminClient();
    const { data: booking, error } = await admin
      .from("bookings")
      .select(
        "id, status, client_name, review_submitted_at, services(name)",
      )
      .eq("review_token", token)
      .maybeSingle();

    if (error || !booking) {
      return NextResponse.json({ error: "Invalid or expired review link." }, { status: 404 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Reviews are available after your appointment is marked complete." },
        { status: 400 },
      );
    }

    if (booking.review_submitted_at) {
      return NextResponse.json({ error: "You already submitted a review. Thank you!" }, { status: 400 });
    }

    const serviceJoin = booking.services as { name?: string } | { name?: string }[] | null;
    const serviceName = Array.isArray(serviceJoin)
      ? serviceJoin[0]?.name
      : serviceJoin?.name;

    const clientName = booking.client_name?.trim() || "Glam Room Client";

    const { count } = await admin
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("booking_id", booking.id);

    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: "Review already received. Thank you!" }, { status: 400 });
    }

    const { data: maxSort } = await admin
      .from("testimonials")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    await admin.from("testimonials").insert({
      name: clientName,
      service: serviceName ?? "Glam Room Client",
      quote,
      rating,
      published: false,
      sort_order: Number(maxSort?.sort_order ?? 0) + 1,
      booking_id: booking.id,
      source: "client",
    });

    await admin
      .from("bookings")
      .update({
        review_submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not submit review. Please try again." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: booking, error } = await admin
      .from("bookings")
      .select("id, status, client_name, review_submitted_at, start_at, services(name)")
      .eq("review_token", token)
      .maybeSingle();

    if (error || !booking) {
      return NextResponse.json({ error: "Invalid review link." }, { status: 404 });
    }

    const serviceJoin = booking.services as { name?: string } | { name?: string }[] | null;
    const serviceName = Array.isArray(serviceJoin)
      ? serviceJoin[0]?.name
      : serviceJoin?.name;

    return NextResponse.json({
      client_name: booking.client_name ?? "Guest",
      service: serviceName ?? "Glam Room appointment",
      visit_date: booking.start_at,
      status: booking.status,
      already_submitted: Boolean(booking.review_submitted_at),
    });
  } catch {
    return NextResponse.json({ error: "Review link unavailable." }, { status: 503 });
  }
}
