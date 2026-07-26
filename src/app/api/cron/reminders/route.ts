import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";
import { generateReviewToken, reviewPageUrl } from "@/lib/reviews/review-token";
import {
  renderReminderEmail,
  renderReviewFollowUpEmail,
} from "@/lib/notifications/email-templates";
import { BRAND } from "@/lib/constants/brand";
import { SALON_LOCATIONS } from "@/lib/constants/locations";

function inWindow(iso: string, fromMs: number, toMs: number): boolean {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return t >= now + fromMs && t <= now + toMs;
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Accra",
  }).format(new Date(iso));
}

/**
 * Daily cron (Vercel Hobby): booking reminders + post-completion follow-up.
 * Runs once per day at 08:00 UTC. Wider windows compensate for non-hourly schedule.
 * Set CRON_SECRET in Vercel env; Pro plan can use `0 * * * *` for hourly precision.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://glam-room-gilt.vercel.app";
  const trackUrl = `${appUrl}/track`;

  const { data: bookings } = await admin
    .from("bookings")
    .select(
      "id, user_id, start_at, end_at, status, reminder_state, follow_up_sent_at, review_token, review_submitted_at, client_phone, client_name, location_id, profiles(phone), services(name)",
    )
    .in("status", ["confirmed", "completed"]);

  let reminders24 = 0;
  let reminders2 = 0;
  let followUps = 0;

  const h20 = 20 * 60 * 60 * 1000;
  const h30 = 30 * 60 * 60 * 1000;
  const h2 = 2 * 60 * 60 * 1000;
  const h14 = 14 * 60 * 60 * 1000;

  const yesterdayStart = new Date();
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  for (const b of bookings ?? []) {
    const state = (b.reminder_state as Record<string, boolean> | null) ?? {};
    const phone =
      (b.profiles as { phone?: string | null } | null)?.phone ??
      (b as { client_phone?: string | null }).client_phone ??
      null;
    const clientName =
      (b as { client_name?: string | null }).client_name?.trim() || "there";
    const serviceRelation = b.services as { name?: string | null } | { name?: string | null }[] | null;
    const service = Array.isArray(serviceRelation)
      ? serviceRelation[0]?.name?.trim() || undefined
      : serviceRelation?.name?.trim() || undefined;
    const locationId = (b as { location_id?: string | null }).location_id;
    const location =
      SALON_LOCATIONS.find((loc) => loc.id === locationId)?.area ?? undefined;

    if (b.status === "confirmed" && b.start_at) {
      if (!state.h24 && inWindow(b.start_at, h20, h30) && phone) {
        const when = formatWhen(b.start_at);
        await sendTransactionalMessage({
          toPhone: phone,
          subject: "Appointment reminder — Glam Room",
          html: renderReminderEmail({
            clientName,
            when,
            location,
            service,
            trackUrl,
            whatsAppUrl: BRAND.links.whatsapp,
            timing: "24h",
          }),
          smsText: `Glam Room reminder: your appointment is tomorrow (${when}). Manage: ${trackUrl}`,
        });
        await admin
          .from("bookings")
          .update({
            reminder_state: { ...state, h24: true },
            updated_at: new Date().toISOString(),
          })
          .eq("id", b.id);
        reminders24 += 1;
      }
      if (!state.h2 && inWindow(b.start_at, h2, h14) && phone) {
        const when = formatWhen(b.start_at);
        await sendTransactionalMessage({
          toPhone: phone,
          subject: "Appointment today — Glam Room",
          html: renderReminderEmail({
            clientName,
            when,
            location,
            service,
            trackUrl,
            whatsAppUrl: BRAND.links.whatsapp,
            timing: "2h",
          }),
          smsText: `Glam Room: your appointment is today (${when}). See you soon!`,
        });
        await admin
          .from("bookings")
          .update({
            reminder_state: { ...state, h2: true },
            updated_at: new Date().toISOString(),
          })
          .eq("id", b.id);
        reminders2 += 1;
      }
    }

    if (
      b.status === "completed" &&
      !b.follow_up_sent_at &&
      !b.review_submitted_at &&
      b.end_at
    ) {
      const end = new Date(b.end_at);
      if (end >= yesterdayStart && end <= yesterdayEnd) {
        let reviewToken = (b as { review_token?: string | null }).review_token;
        if (!reviewToken) {
          reviewToken = generateReviewToken();
          await admin.from("bookings").update({ review_token: reviewToken }).eq("id", b.id);
        }

        const reviewUrl = reviewPageUrl(reviewToken);

        if (b.user_id) {
          await admin.from("notifications").insert({
            user_id: b.user_id,
            title: "How was your look?",
            body: "We would love a short review. Thank you for choosing The Glam Room.",
            type: "follow_up",
          });
        }

        if (phone) {
          await sendTransactionalMessage({
            toPhone: phone,
            subject: "How was your Glam Room visit?",
            html: renderReviewFollowUpEmail({ clientName, reviewUrl }),
            smsText: `The Glam Room: how was your visit? Leave a review: ${reviewUrl}`,
          });
        }

        await admin
          .from("bookings")
          .update({
            follow_up_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", b.id);
        followUps += 1;
      }
    }
  }

  return NextResponse.json({ ok: true, reminders24, reminders2, followUps });
}
