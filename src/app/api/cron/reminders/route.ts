import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";

function inWindow(iso: string, fromMs: number, toMs: number): boolean {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return t >= now + fromMs && t <= now + toMs;
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
  const { data: bookings } = await admin
    .from("bookings")
    .select(
      "id, user_id, start_at, end_at, status, reminder_state, follow_up_sent_at, client_phone, profiles(phone)",
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

    if (b.status === "confirmed" && b.start_at) {
      if (!state.h24 && inWindow(b.start_at, h20, h30) && phone) {
        await sendTransactionalMessage({
          toPhone: phone,
          subject: "Appointment reminder",
          html: "<p>Reminder: your Glam Room appointment is tomorrow.</p>",
          smsText: "The Glam Room: your appointment is within 24 hours. Reply if you need to reschedule.",
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
        await sendTransactionalMessage({
          toPhone: phone,
          subject: "Appointment today",
          html: "<p>Your Glam Room appointment is coming up soon.</p>",
          smsText: "The Glam Room: your appointment is today. See you soon!",
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

    if (b.status === "completed" && !b.follow_up_sent_at && b.end_at) {
      const end = new Date(b.end_at);
      if (end >= yesterdayStart && end <= yesterdayEnd) {
        await admin.from("notifications").insert({
          user_id: b.user_id,
          title: "How was your look?",
          body: "We would love a short review. Thank you for choosing The Glam Room.",
          type: "follow_up",
        });
        await admin
          .from("bookings")
          .update({ follow_up_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", b.id);
        followUps += 1;
      }
    }
  }

  return NextResponse.json({ ok: true, reminders24, reminders2, followUps });
}
