import { NextResponse } from "next/server";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import {
  nameSuffixMatches,
  normalizePhoneDigits,
  parseClientNotesField,
  phoneVariants,
} from "@/lib/booking/phone";
import { rateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingLookupSchema } from "@/lib/validation/booking-lookup";

export const dynamic = "force-dynamic";

function formatBookingDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
  });
}

function formatBookingTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function locationLabel(locationId: string | null) {
  if (!locationId) return null;
  return SALON_LOCATIONS.find((l) => l.id === locationId)?.area ?? locationId;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`booking-lookup:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bookingLookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { phone, nameSuffix } = parsed.data;
  const variants = new Set(phoneVariants(phone).map(normalizePhoneDigits));

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("id, start_at, status, client_name, client_phone, location_id, client_notes, services(name)")
      .in("status", ["pending", "awaiting_approval", "confirmed"])
      .order("start_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: "Booking lookup is unavailable right now." }, { status: 503 });
    }

    const matches = (data ?? []).filter((row) => {
      const storedPhone =
        row.client_phone ??
        parseClientNotesField(row.client_notes, "Phone") ??
        "";
      const storedName =
        row.client_name ?? parseClientNotesField(row.client_notes, "Name") ?? "";
      const phoneHit = phoneVariants(storedPhone).some((v) => variants.has(normalizePhoneDigits(v)));
      return phoneHit && nameSuffixMatches(storedName, nameSuffix);
    });

    if (matches.length === 0) {
      return NextResponse.json({
        error:
          "No booking found. Double-check your phone and the last 4 letters of the name you used when booking.",
      });
    }

    const bookings = matches.map((row) => {
      const serviceJoin = row.services as { name?: string } | { name?: string }[] | null;
      const serviceName = Array.isArray(serviceJoin)
        ? serviceJoin[0]?.name
        : serviceJoin?.name;
      const loc =
        locationLabel(row.location_id) ??
        parseClientNotesField(row.client_notes, "Location")?.replace(/^Glam Room · /i, "");

      return {
        date: formatBookingDate(row.start_at),
        time: formatBookingTime(row.start_at),
        status: (row.status ?? "pending").toUpperCase(),
        service: serviceName ?? "Glam Room appointment",
        location: loc,
      };
    });

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again or WhatsApp Glam Room." },
      { status: 500 },
    );
  }
}
