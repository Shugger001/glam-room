import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyPaystackVerification } from "@/lib/payments/paystack-order-state";
import { rateLimit } from "@/lib/security/rate-limit";

const querySchema = z.object({
  reference: z.string().min(3),
});

/**
 * Verifies a Paystack transaction and optionally marks related orders as paid.
 * Call from a Route Handler or Server Action after redirect (never trust client-only checks).
 */
export async function GET(request: Request) {
  const origin = request.headers.get("x-forwarded-for") ?? request.headers.get("host") ?? "unknown";
  if (!rateLimit(`paystack-verify:${origin}`, 40, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many verify requests." }, { status: 429 });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "PAYSTACK_SECRET_KEY is not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ reference: searchParams.get("reference") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid reference" }, { status: 400 });
  }

  const { reference } = parsed.data;

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  const payload = (await res.json()) as {
    status?: boolean;
    message?: string;
    data?: { status?: string; amount?: number; currency?: string; metadata?: Record<string, unknown> };
  };

  if (!res.ok || !payload.status) {
    return NextResponse.json(
      { ok: false, error: payload.message ?? "Verification failed" },
      { status: 400 },
    );
  }

  const tx = payload.data;
  const success = tx?.status === "success";

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      await applyPaystackVerification(admin, {
        reference,
        amountMinor: typeof tx?.amount === "number" ? tx.amount : null,
        currency: tx?.currency ?? null,
        metadata: (tx?.metadata as Record<string, unknown> | undefined) ?? null,
        paid: success,
        eventType: "redirect_verify",
      });
    } catch {
      /* keep client response deterministic even if persistence fails */
    }
  }

  return NextResponse.json({
    ok: success,
    reference,
    amount: tx?.amount,
    currency: tx?.currency,
    metadata: tx?.metadata,
  });
}
