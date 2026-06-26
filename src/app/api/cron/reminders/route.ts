import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalMessage } from "@/lib/notifications/send-transactional";

function inWindow(iso: string, fromMs: number, toMs: number): boolean {
  const t = new Date(iso).getTime();
  const now = Date.now();
  return t >= now + fromMs && t <= now + toMs;
}

/**
 * Hourly cron: booking SMS reminders (≈24h and ≈2h) + post-completion follow-up notification.
 * Vercel: set CRON_SECRET and schedule in vercel.json.
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
    .select("id, user_id, start_at, end_at, status, reminder_state, follow_up_sent_at, profiles(phone)")
    .in("status", ["confirmed", "completed"]);

  let reminders24 = 0;
  let reminders2 = 0;
  let followUps = 0;

  const h23 = 23 * 60 * 60 * 1000;
  const h25 = 25 * 60 * 60 * 1000;
  const h90m = 90 * 60 * 1000;
  const h150m = 150 * 60 * 1000;

  const yesterdayStart = new Date();
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  for (const b of bookings ?? []) {
    const state = (b.reminder_state as Record<string, boolean> | null) ?? {};
    const phone = (b.profiles as { phone?: string | null } | null)?.phone ?? null;

    if (b.status === "confirmed" && b.start_at) {
      if (!state.h24 && inWindow(b.start_at, h23, h25) && phone) {
        await sendTransactionalMessage({
          toPhone: phone,
          subject: "Booking reminder",
          html: "<p>Reminder: your Kabuki appointment is tomorrow.</p>",
          smsText: "Kabuki reminder: your makeup appointment is within 24 hours. Reply if you need to reschedule.",
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
      if (!state.h2 && inWindow(b.start_at, h90m, h150m) && phone) {
        await sendTransactionalMessage({
          toPhone: phone,
          subject: "Booking soon",
          html: "<p>Your Kabuki session is coming up in about two hours.</p>",
          smsText: "Kabuki: your appointment is in ~2 hours. See you soon!",
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
          body: "We would love a short review or referral. Thank you for choosing Kabuki.",
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
