import { NextResponse } from "next/server";
import { insertGuestBooking } from "@/lib/booking/create-guest-booking";
import { computeDepositAmount, isPaystackConfigured } from "@/lib/booking/deposit";
import { MARKET } from "@/lib/constants/market";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { resolvePromoForBooking } from "@/lib/promotions/validate-promo";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security/rate-limit";
import { bookingPaystackInitializeSchema } from "@/lib/validation/booking-payment";

function paystackEmail(values: { clientEmail?: string; clientPhone: string; clientName: string }) {
  const email = values.clientEmail?.trim();
  if (email) return email;
  const digits = values.clientPhone.replace(/\D/g, "").slice(-10);
  return `booking+${digits || "guest"}@clients.theglamroom.com`;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`paystack-booking:${ip}`, 15, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }

  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Online deposits are not available yet." }, { status: 503 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY!.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3100";
  const currency =
    process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY?.trim().toUpperCase() || MARKET.currencyCode;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bookingPaystackInitializeSchema.safeParse(body);
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

  const servicePrice = Number(serviceRow.base_price);
  const baseDeposit = computeDepositAmount(servicePrice);
  if (baseDeposit <= 0) {
    return NextResponse.json({ error: "No deposit required for this service." }, { status: 400 });
  }

  const promoResult = await resolvePromoForBooking(admin, values.promoCode, baseDeposit);
  if (!promoResult.ok) {
    return NextResponse.json({ error: promoResult.error }, { status: 400 });
  }

  const depositAmount = promoResult.promo?.depositAmount ?? baseDeposit;

  const locationLabel =
    SALON_LOCATIONS.find((l) => l.id === values.locationId)?.area ?? values.locationId;

  const reference = `glam_bk_${crypto.randomUUID().replace(/-/g, "")}`;

  const created = await insertGuestBooking(admin, {
    values,
    staffId,
    service: {
      id: serviceRow.id as string,
      durationMinutes: Number(serviceRow.duration_minutes),
      price: servicePrice,
    },
    locationLabel,
    paystackReference: reference,
    depositPaid: false,
    depositAmount,
    promotionCode: promoResult.promo?.promotionCode ?? null,
    promoMeta: promoResult.promo?.promoMeta ?? null,
  });

  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  const amountMinor = Math.round(depositAmount * 100);
  const email = paystackEmail(values);

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountMinor,
      currency,
      reference,
      callback_url: `${appUrl}/book/complete?reference=${encodeURIComponent(reference)}`,
      metadata: {
        payment_type: "booking_deposit",
        booking_id: created.bookingId,
        service_name: serviceRow.name,
        client_name: values.clientName.trim(),
        expected_amount_minor: amountMinor,
        expected_currency: currency,
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }),
  });

  const data = (await res.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string };
  };

  if (!res.ok || !data.status || !data.data?.authorization_url) {
    await admin.from("bookings").delete().eq("id", created.bookingId);
    return NextResponse.json(
      { error: data.message ?? "Could not start Paystack checkout." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    authorization_url: data.data.authorization_url,
    reference: data.data.reference ?? reference,
    deposit_amount: depositAmount,
    base_deposit: baseDeposit,
    promo_savings: promoResult.promo ? baseDeposit - depositAmount : 0,
    booking_id: created.bookingId,
  });
}
