import type { SupabaseClient } from "@supabase/supabase-js";
import { isPaystackConfigured } from "@/lib/booking/deposit";
import { notificationsConfigured } from "@/lib/notifications/salon-contact";

export type IntegrationHealth = {
  paystackConfigured: boolean;
  notifications: ReturnType<typeof notificationsConfigured>;
  appUrlSet: boolean;
  cronConfigured: boolean;
  supabaseOk: boolean;
  webhooksLast7d: number;
  deadLettersLast7d: number;
  recentDeadLetters: { message: string; created_at: string }[];
  paidDepositsLast7d: number;
  unpaidDepositsOpen: number;
};

export async function loadIntegrationHealth(admin: SupabaseClient): Promise<IntegrationHealth> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const since = sevenDaysAgo.toISOString();

  const [
    supabasePing,
    webhooksRes,
    deadLettersCountRes,
    deadLettersRecentRes,
    paidDepositsRes,
    unpaidDepositsRes,
  ] = await Promise.all([
    admin.from("services").select("id", { count: "exact", head: true }).limit(1),
    admin
      .from("paystack_webhook_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    admin
      .from("ops_dead_letter_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    admin
      .from("ops_dead_letter_log")
      .select("message, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("deposit_paid", true)
      .gt("deposit_amount", 0)
      .gte("updated_at", since),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("deposit_paid", false)
      .gt("deposit_amount", 0)
      .in("status", ["pending", "awaiting_approval", "confirmed"]),
  ]);

  return {
    paystackConfigured: isPaystackConfigured(),
    notifications: notificationsConfigured(),
    appUrlSet: Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim()),
    cronConfigured: Boolean(process.env.CRON_SECRET?.trim()),
    supabaseOk: !supabasePing.error,
    webhooksLast7d: webhooksRes.count ?? 0,
    deadLettersLast7d: deadLettersCountRes.count ?? 0,
    recentDeadLetters: (deadLettersRecentRes.data ?? []) as IntegrationHealth["recentDeadLetters"],
    paidDepositsLast7d: paidDepositsRes.count ?? 0,
    unpaidDepositsOpen: unpaidDepositsRes.count ?? 0,
  };
}
