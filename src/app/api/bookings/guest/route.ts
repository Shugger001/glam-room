import { NextResponse } from "next/server";
import { z } from "zod";
import { insertGuestBooking } from "@/lib/booking/create-guest-booking";
import { computeDepositAmount, isPaystackConfigured } from "@/lib/booking/deposit";
import { getLiveLocations, locationLabelFromList } from "@/lib/data/live-site-content";
import {
  notifyClientBookingUpdate,
  notifySalonBookingRequest,
} from "@/lib/notifications/booking-notifications";
import { resolvePromoForBooking } from "@/lib/promotions/validate-promo";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security/rate-limit";
import { guestBookingSchema } from "@/lib/validation/booking";

const guestBookingRequestSchema = guestBookingSchema.extend({
  staffId: z.string().uuid("Invalid stylist assignment"),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await rateLimit(`guest-booking:${ip}`, 12, 60_000))) {
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
      .select("id, name, duration_minutes, base_price, active, location_ids")
      .eq("id", values.serviceId)
      .maybeSingle(),
    admin
      .from("staff")
      .select("id, active, is_front_desk, home_location_id")
      .eq("id", staffId)
      .maybeSingle(),
  ]);

  if (serviceError || !serviceRow || serviceRow.active === false) {
    return NextResponse.json({ error: "Selected service is unavailable." }, { status: 400 });
  }

  const serviceLocationIds = Array.isArray(serviceRow.location_ids)
    ? (serviceRow.location_ids as string[])
    : [];
  if (
    serviceLocationIds.length > 0 &&
    !serviceLocationIds.includes(values.locationId)
  ) {
    return NextResponse.json(
      { error: "That service is only available at another Glam Room shop." },
      { status: 400 },
    );
  }

  if (!staffRow || staffRow.active === false || staffRow.is_front_desk === true) {
    return NextResponse.json({ error: "Stylist assignment is invalid." }, { status: 400 });
  }
  if (
    typeof staffRow.home_location_id === "string" &&
    staffRow.home_location_id.length > 0 &&
    staffRow.home_location_id !== values.locationId
  ) {
    return NextResponse.json(
      { error: "That stylist does not work at this shop. Pick another expert." },
      { status: 400 },
    );
  }

  const locationLabel =
    locationLabelFromList(values.locationId, await getLiveLocations()) ?? values.locationId;

  const servicePrice = Number(serviceRow.base_price);
  const baseDeposit = computeDepositAmount(servicePrice);
  const promoResult = await resolvePromoForBooking(admin, values.promoCode, baseDeposit);
  if (!promoResult.ok) {
    return NextResponse.json({ error: promoResult.error }, { status: 400 });
  }

  const depositAmount = promoResult.promo?.depositAmount ?? baseDeposit;

  const created = await insertGuestBooking(admin, {
    values,
    staffId,
    service: {
      id: serviceRow.id as string,
      durationMinutes: Number(serviceRow.duration_minutes),
      price: servicePrice,
    },
    locationLabel,
    depositPaid: false,
    depositAmount,
    promotionCode: promoResult.promo?.promotionCode ?? null,
    promoMeta: promoResult.promo?.promoMeta ?? null,
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
