import { NextResponse } from "next/server";
import { validateBookingCapacity } from "@/lib/booking/availability";
import { MANAGEABLE_STATUSES, verifyClientBooking } from "@/lib/booking/lookup-match";
import { getLiveLocations, locationLabelFromList } from "@/lib/data/live-site-content";
import { getSalonNotifyContacts } from "@/lib/notifications/salon-contact";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";
import { rateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingManageSchema } from "@/lib/validation/booking-manage";

function locationLabel(locationId: string | null, locations: Awaited<ReturnType<typeof getLiveLocations>>) {
  return locationLabelFromList(locationId, locations) ?? "Glam Room";
}

function serviceName(
  services: { name?: string } | { name?: string }[] | null | undefined,
) {
  if (Array.isArray(services)) return services[0]?.name ?? "appointment";
  return services?.name ?? "appointment";
}

function serviceDuration(
  services: { duration_minutes?: number } | { duration_minutes?: number }[] | null | undefined,
) {
  if (Array.isArray(services)) return Number(services[0]?.duration_minutes ?? 60);
  return Number(services?.duration_minutes ?? 60);
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`booking-manage:${ip}`, 8, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bookingManageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { action, phone, nameSuffix, bookingId } = parsed.data;

  try {
    const admin = createAdminClient();
    const verified = await verifyClientBooking(admin, bookingId, phone, nameSuffix);
    if (verified.error || !verified.booking) {
      return NextResponse.json(
        { error: verified.error ?? "Booking not found." },
        { status: 404 },
      );
    }

    const booking = verified.booking;
    const locations = await getLiveLocations();
    if (!MANAGEABLE_STATUSES.has(booking.status)) {
      return NextResponse.json(
        { error: "This booking can no longer be changed online. WhatsApp us for help." },
        { status: 400 },
      );
    }

    const when = new Date(booking.start_at).toLocaleString("en-GH", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const svc = serviceName(booking.services);
    const loc = locationLabel(booking.location_id, locations);
    const clientName = booking.client_name ?? "Guest";
    const clientPhone = booking.client_phone ?? phone;

    if (action === "cancel") {
      await admin
        .from("bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", bookingId);

      const { email, phone: salonPhone } = getSalonNotifyContacts();
      await sendTransactionalMessage({
        toEmail: email,
        toPhone: salonPhone,
        subject: `Glam Room — booking cancelled (${clientName})`,
        html: `<p>${clientName} cancelled their ${svc} booking on ${when} (${loc}).</p>`,
        smsText: `Glam Room: ${clientName} cancelled ${svc} on ${when} (${loc}).`,
      });

      await sendTransactionalMessage({
        toPhone: clientPhone,
        subject: "Glam Room — booking cancelled",
        html: `<p>Your Glam Room booking for ${svc} on ${when} has been cancelled. WhatsApp us to rebook anytime.</p>`,
        smsText: `The Glam Room: your booking for ${svc} on ${when} was cancelled. WhatsApp us to rebook.`,
      });

      return NextResponse.json({ ok: true, status: "cancelled" });
    }

    const { bookingDate, bookingTime } = parsed.data;
    if (!bookingDate || !bookingTime) {
      return NextResponse.json({ error: "Pick a new date and time." }, { status: 400 });
    }
    const startAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
    const durationMs = serviceDuration(booking.services) * 60_000;
    const endAt = new Date(new Date(startAt).getTime() + durationMs).toISOString();

    if (!booking.location_id) {
      return NextResponse.json({ error: "Booking location is missing." }, { status: 400 });
    }

    const capacity = await validateBookingCapacity(admin, {
      startAt,
      locationId: booking.location_id,
      bookingDate,
    });
    if (!capacity.available) {
      return NextResponse.json(
        { error: capacity.error ?? "That time slot is not available." },
        { status: 400 },
      );
    }

    await admin
      .from("bookings")
      .update({
        start_at: startAt,
        end_at: endAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    const newWhen = new Date(startAt).toLocaleString("en-GH", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const { email, phone: salonPhone } = getSalonNotifyContacts();
    await sendTransactionalMessage({
      toEmail: email,
      toPhone: salonPhone,
      subject: `Glam Room — booking rescheduled (${clientName})`,
      html: `<p>${clientName} moved ${svc} from ${when} to ${newWhen} (${loc}).</p>`,
      smsText: `Glam Room: ${clientName} rescheduled ${svc} to ${newWhen} (${loc}).`,
    });

    await sendTransactionalMessage({
      toPhone: clientPhone,
      subject: "Glam Room — booking rescheduled",
      html: `<p>Your Glam Room booking for ${svc} is now scheduled for ${newWhen} at ${loc}.</p>`,
      smsText: `The Glam Room: ${svc} rescheduled to ${newWhen} (${loc}).`,
    });

    return NextResponse.json({ ok: true, status: booking.status, start_at: startAt });
  } catch {
    return NextResponse.json({ error: "Could not update booking. Please try again." }, { status: 500 });
  }
}
