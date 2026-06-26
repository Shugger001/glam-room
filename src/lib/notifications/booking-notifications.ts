import type { SupabaseClient } from "@supabase/supabase-js";
import { locationLabelFromId } from "@/lib/admin/access";
import { BOOKING_DEPOSIT_GHS } from "@/lib/booking/deposit";
import { parseClientNotesField } from "@/lib/booking/phone";
import { formatShopPrice } from "@/lib/format/money";
import { getSalonNotifyContacts } from "@/lib/notifications/salon-contact";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";

type BookingRow = {
  id: string;
  start_at: string;
  client_name: string | null;
  client_phone: string | null;
  client_notes: string | null;
  deposit_paid: boolean | null;
  deposit_amount: number | null;
  location_id: string | null;
  services: { name?: string } | { name?: string }[] | null;
};

function serviceName(services: BookingRow["services"]) {
  if (Array.isArray(services)) return services[0]?.name ?? "Glam Room appointment";
  return services?.name ?? "Glam Room appointment";
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

async function loadBooking(admin: SupabaseClient, bookingId: string) {
  const { data, error } = await admin
    .from("bookings")
    .select(
      "id, start_at, client_name, client_phone, client_notes, deposit_paid, deposit_amount, location_id, services(name)",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !data) return null;
  return data as BookingRow;
}

function clientEmailFromNotes(notes: string | null) {
  return parseClientNotesField(notes, "Email");
}

function bookingSummary(booking: BookingRow) {
  const clientName = booking.client_name?.trim() || "Guest";
  const when = formatWhen(booking.start_at);
  const location = locationLabelFromId(booking.location_id) ?? "Glam Room";
  const service = serviceName(booking.services);
  const deposit = Number(booking.deposit_amount ?? BOOKING_DEPOSIT_GHS);
  const depositLine = booking.deposit_paid
    ? `Deposit paid: ${formatShopPrice(deposit)}`
    : deposit > 0
      ? `Deposit pending: ${formatShopPrice(deposit)}`
      : "No deposit required";

  return { clientName, when, location, service, depositLine };
}

/** Alert salon team about a new or secured booking request. */
export async function notifySalonBookingRequest(
  admin: SupabaseClient,
  bookingId: string,
  event: "created" | "deposit_paid",
) {
  const booking = await loadBooking(admin, bookingId);
  if (!booking) return;

  const { clientName, when, location, service, depositLine } = bookingSummary(booking);
  const clientPhone = booking.client_phone ?? parseClientNotesField(booking.client_notes, "Phone");
  const subject =
    event === "deposit_paid" ? "New booking — deposit received" : "New booking request";

  const html = `
    <p><strong>${clientName}</strong> booked <strong>${service}</strong>.</p>
    <p>${when}<br/>${location}<br/>${depositLine}</p>
    ${clientPhone ? `<p>Phone: ${clientPhone}</p>` : ""}
    <p>Review in admin: ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin/appointments</p>
  `.trim();

  const smsText =
    event === "deposit_paid"
      ? `Glam Room: ${clientName} paid deposit for ${service} on ${when} (${location}).`
      : `Glam Room: new booking request from ${clientName} for ${service} on ${when} (${location}).`;

  const { email, phone } = getSalonNotifyContacts();
  await sendTransactionalMessage({
    toEmail: email,
    toPhone: phone,
    subject,
    html,
    smsText,
  });
}

/** Confirm receipt to the client after booking or deposit. */
export async function notifyClientBookingUpdate(
  admin: SupabaseClient,
  bookingId: string,
  event: "submitted" | "deposit_paid",
) {
  const booking = await loadBooking(admin, bookingId);
  if (!booking) return;

  const { clientName, when, location, service } = bookingSummary(booking);
  const clientPhone = booking.client_phone ?? parseClientNotesField(booking.client_notes, "Phone");
  const clientEmail = clientEmailFromNotes(booking.client_notes);

  const subject =
    event === "deposit_paid" ? "Glam Room — deposit received" : "Glam Room — booking received";

  const html =
    event === "deposit_paid"
      ? `<p>Hi ${clientName},</p><p>We received your ${formatShopPrice(Number(booking.deposit_amount ?? BOOKING_DEPOSIT_GHS))} deposit for <strong>${service}</strong> on ${when} at ${location}.</p><p>Our team will confirm your appointment via WhatsApp shortly.</p>`
      : `<p>Hi ${clientName},</p><p>We received your booking request for <strong>${service}</strong> on ${when} at ${location}.</p><p>Our team will confirm via WhatsApp shortly.</p>`;

  const smsText =
    event === "deposit_paid"
      ? `The Glam Room: deposit received for ${service} on ${when}. We'll confirm your appointment soon.`
      : `The Glam Room: we received your booking request for ${service} on ${when}. We'll confirm soon.`;

  await sendTransactionalMessage({
    toEmail: clientEmail,
    toPhone: clientPhone,
    subject,
    html,
    smsText,
  });
}
