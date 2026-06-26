import { NextResponse } from "next/server";
import { z } from "zod";
import { insertGuestBooking } from "@/lib/booking/create-guest-booking";
import { isPaystackConfigured } from "@/lib/booking/deposit";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import {
  notifyClientBookingUpdate,
  notifySalonBookingRequest,
} from "@/lib/notifications/booking-notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security/rate-limit";
import { guestBookingSchema } from "@/lib/validation/booking";

const guestBookingRequestSchema = guestBookingSchema.extend({
  staffId: z.string().uuid("Invalid stylist assignment"),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`guest-booking:${ip}`, 12, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  if (isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Online deposit checkout is required for this booking." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = guestBookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid booking details." },
      { status: 400 },
    );
  }

  const { staffId, ...values } = parsed.data;
  const admin = createAdminClient();

  const [{ data: serviceRow, error: serviceError }, { data: staffRow }] = await Promise.all([
    admin
      .from("services")
      .select("id, name, duration_minutes, base_price, active")
      .eq("id", values.serviceId)
      .maybeSingle(),
    admin.from("staff").select("id, active").eq("id", staffId).maybeSingle(),
  ]);

  if (serviceError || !serviceRow || serviceRow.active === false) {
    return NextResponse.json({ error: "Selected service is unavailable." }, { status: 400 });
  }

  if (!staffRow || staffRow.active === false) {
    return NextResponse.json({ error: "Stylist assignment is invalid." }, { status: 400 });
  }

  const locationLabel =
    SALON_LOCATIONS.find((l) => l.id === values.locationId)?.area ?? values.locationId;

  const created = await insertGuestBooking(admin, {
    values,
    staffId,
    service: {
      id: serviceRow.id as string,
      durationMinutes: Number(serviceRow.duration_minutes),
      price: Number(serviceRow.base_price),
    },
    locationLabel,
    depositPaid: false,
  });

  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  await Promise.allSettled([
    notifySalonBookingRequest(admin, created.bookingId, "created"),
    notifyClientBookingUpdate(admin, created.bookingId, "submitted"),
  ]);

  return NextResponse.json({ ok: true, booking_id: created.bookingId });
}
