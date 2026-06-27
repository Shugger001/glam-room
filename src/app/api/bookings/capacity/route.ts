import { NextResponse } from "next/server";
import { z } from "zod";
import { getShopDailyBookingStatus } from "@/lib/booking/availability";
import { getLiveLocations, locationLabelFromList } from "@/lib/data/live-site-content";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security/rate-limit";

const querySchema = z.object({
  locationId: z.string().min(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`booking-capacity:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    locationId: searchParams.get("locationId") ?? "",
    bookingDate: searchParams.get("bookingDate") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid location or date." }, { status: 400 });
  }

  const locations = await getLiveLocations();
  const validLocationIds = new Set(locations.map((l) => l.id));
  if (!validLocationIds.has(parsed.data.locationId)) {
    return NextResponse.json({ error: "Unknown location." }, { status: 400 });
  }

  const selectedDate = new Date(`${parsed.data.bookingDate}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return NextResponse.json({ error: "Date must be today or later." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const status = await getShopDailyBookingStatus(
      admin,
      parsed.data.locationId,
      parsed.data.bookingDate,
    );

    if (status.error) {
      return NextResponse.json({ error: status.error }, { status: 503 });
    }

    const locationLabel =
      locationLabelFromList(parsed.data.locationId, locations) ?? "This shop";

    return NextResponse.json({
      fullyBooked: status.fullyBooked,
      count: status.count,
      max: status.max,
      remaining: Math.max(0, status.max - status.count),
      locationLabel,
    });
  } catch {
    return NextResponse.json({ error: "Could not check availability." }, { status: 503 });
  }
}
