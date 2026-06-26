import { NextResponse } from "next/server";
import { MARKET } from "@/lib/constants/market";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { paystackInitializeSchema } from "@/lib/validation/checkout";

/**
 * Initializes a Paystack transaction (server-side).
 * Amount is accepted in major units (e.g. GHS cedis) and converted to pesewas (×100).
 */
export async function POST(request: Request) {
  const origin = request.headers.get("x-forwarded-for") ?? request.headers.get("host") ?? "unknown";
  if (!rateLimit(`paystack-init:${origin}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many checkout attempts. Please wait a minute." }, { status: 429 });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3100";

  if (!secret) {
    return NextResponse.json(
      { error: "PAYSTACK_SECRET_KEY is not configured" },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = paystackInitializeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, amount, metadata, items } = parsed.data;
  const currency =
    process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY?.trim().toUpperCase() || MARKET.currencyCode;
  const admin = createAdminClient();

  const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, price, active, inventory")
    .in("id", uniqueProductIds)
    .eq("active", true);
  if (productsError || !products || products.length === 0) {
    return NextResponse.json({ error: "No valid products found for checkout." }, { status: 400 });
  }

  const byId = new Map(
    products.map((p) => [
      p.id as string,
      {
        price: typeof p.price === "number" ? p.price : Number(p.price),
        inventory: typeof p.inventory === "number" ? p.inventory : Number(p.inventory),
      },
    ]),
  );
  const normalizedItems = items
    .map((item) => {
      const row = byId.get(item.productId);
      if (!row || Number.isNaN(row.price) || Number.isNaN(row.inventory)) return null;
      if (row.inventory < item.quantity) return null;
      return { product_id: item.productId, quantity: item.quantity, unit_price: row.price };
    })
    .filter((x): x is { product_id: string; quantity: number; unit_price: number } => Boolean(x));
  if (normalizedItems.length === 0) {
    return NextResponse.json({ error: "Checkout items are invalid." }, { status: 400 });
  }

  const subtotal = normalizedItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  if (Math.abs(subtotal - amount) > 0.5) {
    return NextResponse.json(
      { error: "Checkout amount mismatch. Refresh your cart and try again." },
      { status: 400 },
    );
  }
  const amountMinor = Math.round(subtotal * 100);

  const reference = `glam_${crypto.randomUUID().replace(/-/g, "")}`;
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const metaObject =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {};

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending_payment",
      paystack_reference: reference,
      subtotal,
      total: subtotal,
      currency,
      metadata: {
        ...metaObject,
        checkout_email: email,
        source: "web-cart",
      },
    })
    .select("id")
    .single();
  if (orderError || !order?.id) {
    return NextResponse.json({ error: orderError?.message ?? "Could not create order." }, { status: 500 });
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    normalizedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  );
  if (itemsError) {
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountMinor,
      currency,
      reference,
      callback_url: `${appUrl}/shop/cart?reference=${encodeURIComponent(reference)}`,
      metadata: {
        ...metaObject,
        reference,
        order_id: order.id,
        expected_amount_minor: amountMinor,
        expected_currency: currency,
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }),
  });

  const data = (await res.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string };
  };

  if (!res.ok || !data.status) {
    await admin
      .from("orders")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", order.id);
    return NextResponse.json(
      { error: data.message ?? "Paystack initialization failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    authorization_url: data.data?.authorization_url,
    reference: data.data?.reference ?? reference,
  });
}
