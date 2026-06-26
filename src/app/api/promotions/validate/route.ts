import { NextResponse } from "next/server";
import { z } from "zod";
import { BOOKING_DEPOSIT_GHS } from "@/lib/booking/deposit";
import { validatePromotionCode } from "@/lib/promotions/validate-promo";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  code: z.string().trim().min(2).max(40),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`promo-validate:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid promo code." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const result = await validatePromotionCode(admin, parsed.data.code, BOOKING_DEPOSIT_GHS);

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: result.promotion.code,
      title: result.promotion.title,
      base_deposit: result.baseDeposit,
      deposit_amount: result.discountedDeposit,
      savings: result.savings,
      label: result.label,
    });
  } catch {
    return NextResponse.json({ error: "Could not validate promo code." }, { status: 503 });
  }
}
