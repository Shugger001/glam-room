import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAndApplyBookingPayment } from "@/lib/payments/paystack-booking-state";
import { rateLimit } from "@/lib/security/rate-limit";

const querySchema = z.object({
  reference: z.string().min(3),
});

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`paystack-booking-verify:${ip}`, 40, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many verify requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ reference: searchParams.get("reference") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid reference" }, { status: 400 });
  }

  try {
    const result = await verifyAndApplyBookingPayment(parsed.data.reference);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error ?? "Payment verification failed." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      reference: parsed.data.reference,
      booking_id: result.bookingId,
      already_paid: result.alreadyPaid ?? false,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Verification failed." }, { status: 500 });
  }
}
