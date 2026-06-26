import crypto from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyPaystackVerification } from "@/lib/payments/paystack-order-state";
import { rateLimit } from "@/lib/security/rate-limit";
import { captureServerException } from "@/lib/observability/capture-exception";

type PaystackWebhook = {
  event?: string;
  data?: {
    id?: number;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, unknown>;
  };
};

function validSignature(raw: string, secret: string, signature: string | null): boolean {
  if (!signature) return false;
  const hash = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function POST(request: Request) {
  const source = request.headers.get("x-forwarded-for") ?? "paystack";
  if (!rateLimit(`paystack-webhook:${source}`, 120, 60_000)) {
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: "Webhook environment not configured." }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!validSignature(raw, secret, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let payload: PaystackWebhook;
  try {
    payload = JSON.parse(raw) as PaystackWebhook;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const event = payload.event ?? "";
  const tx = payload.data;
  const reference = tx?.reference;
  if (!reference) {
    return NextResponse.json({ ok: false, error: "Missing transaction reference." }, { status: 400 });
  }

  // strict event handling: process only payment state events
  if (event !== "charge.success" && event !== "charge.failed") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const admin = createAdminClient();
  const eventId = typeof tx?.id === "number" ? String(tx.id) : `anon-${reference}-${event}`;
  const { error: ledgerError } = await admin.from("paystack_webhook_events").insert({
    event_id: eventId,
    event_type: event,
    reference,
    payload,
  });
  if (ledgerError && !ledgerError.message.toLowerCase().includes("duplicate")) {
    await admin.from("ops_dead_letter_log").insert({
      source: "paystack_webhook",
      message: `paystack_webhook_events insert failed: ${ledgerError.message}`,
      payload: { reference, event },
    });
  }
  if (ledgerError && ledgerError.message.toLowerCase().includes("duplicate")) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  let result: Awaited<ReturnType<typeof applyPaystackVerification>>;
  try {
    result = await applyPaystackVerification(admin, {
      reference,
      amountMinor: typeof tx?.amount === "number" ? tx.amount : null,
      currency: tx?.currency ?? null,
      metadata: tx?.metadata ?? null,
      paid: event === "charge.success" && tx?.status === "success",
      eventType: event === "charge.success" ? "webhook_charge_success" : "webhook_charge_failed",
      eventId,
    });
  } catch (e) {
    await captureServerException(e, { reference, event });
    return NextResponse.json({ ok: false, error: "Verification handler error" }, { status: 500 });
  }

  if (!result.ok && result.reason === "Order not found for reference.") {
    return NextResponse.json({ ok: true, ignored: true, reason: result.reason });
  }
  if (!result.ok && result.reason) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
