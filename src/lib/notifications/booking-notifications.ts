import type { SupabaseClient } from "@supabase/supabase-js";
import { locationLabelFromId } from "@/lib/admin/access";
import { BOOKING_DEPOSIT_GHS } from "@/lib/booking/deposit";
import { parseClientNotesField } from "@/lib/booking/phone";
import { renderBookingEmail } from "@/lib/notifications/email-templates";
import { getSalonNotifyContacts } from "@/lib/notifications/salon-contact";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";
import {
  buildClientBookingSupportLink,
  buildClientReplyLink,
} from "@/lib/notifications/whatsapp-links";
import { formatShopPrice } from "@/lib/format/money";

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

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://glam-room-gilt.vercel.app";
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
    ? `Paid · ${formatShopPrice(deposit)}`
    : deposit > 0
      ? `Pending · ${formatShopPrice(deposit)}`
      : "Not required";

  return { clientName, when, location, service, depositLine, deposit };
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
  const adminUrl = `${appBaseUrl()}/admin/appointments`;
  const whatsAppUrl = clientPhone
    ? buildClientReplyLink(clientPhone, clientName, service, when)
    : null;

  const subject =
    event === "deposit_paid" ? "New booking — deposit received" : "New booking request";

  const html = renderBookingEmail({
    variant: event === "deposit_paid" ? "salon_deposit_paid" : "salon_new",
    clientName,
    service,
    when,
    location,
    depositLine,
    clientPhone,
    adminUrl,
    whatsAppUrl,
  });

  const smsText = [
    event === "deposit_paid"
      ? `Glam Room: ${clientName} paid deposit for ${service} on ${when} (${location}).`
      : `Glam Room: new booking from ${clientName} for ${service} on ${when} (${location}).`,
    clientPhone ? `Client: ${clientPhone}` : null,
    whatsAppUrl ? `WhatsApp: ${whatsAppUrl}` : null,
    `Admin: ${adminUrl}`,
  ]
    .filter(Boolean)
    .join(" ");

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

  const { clientName, when, location, service, depositLine } = bookingSummary(booking);
  const clientPhone = booking.client_phone ?? parseClientNotesField(booking.client_notes, "Phone");
  const clientEmail = clientEmailFromNotes(booking.client_notes);
  const trackUrl = `${appBaseUrl()}/#track-booking`;
  const whatsAppUrl = buildClientBookingSupportLink(clientName, service, when);

  const subject =
    event === "deposit_paid" ? "Glam Room — deposit received" : "Glam Room — booking received";

  const html = renderBookingEmail({
    variant: event === "deposit_paid" ? "client_deposit_paid" : "client_submitted",
    clientName,
    service,
    when,
    location,
    depositLine: event === "deposit_paid" ? depositLine : undefined,
    whatsAppUrl,
    trackUrl,
  });

  const smsText =
    event === "deposit_paid"
      ? `The Glam Room: deposit confirmed for ${service} on ${when}. We'll confirm on WhatsApp soon. ${whatsAppUrl ?? ""}`
      : `The Glam Room: booking received for ${service} on ${when}. We'll confirm on WhatsApp soon. ${whatsAppUrl ?? ""}`;

  await sendTransactionalMessage({
    toEmail: clientEmail,
    toPhone: clientPhone,
    subject,
    html,
    smsText: smsText.trim(),
  });
}
