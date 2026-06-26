import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "local";
  if (!rateLimit(`bootstrap-profile:${ip}`, 30, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  let referralFromBody: string | null = null;
  try {
    const body = (await request.json()) as { referralCode?: unknown };
    referralFromBody = typeof body?.referralCode === "string" ? body.referralCode : null;
  } catch {
    referralFromBody = null;
  }

  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Supabase is not configured." },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { ok: false, error: "Admin Supabase environment variables are missing." },
      { status: 503 },
    );
  }

  const fullNameFromMeta =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullNameFromMeta,
      avatar_url:
        typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const suggestedCode = `KAB-${user.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  await admin
    .from("profiles")
    .update({ referral_code: suggestedCode, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .is("referral_code", null);

  const normalizedReferral = referralFromBody?.trim().toUpperCase() ?? "";
  if (normalizedReferral.length >= 4) {
    const { data: referrerRow } = await admin
      .from("profiles")
      .select("id")
      .eq("referral_code", normalizedReferral)
      .maybeSingle();
    if (referrerRow?.id && referrerRow.id !== user.id) {
      const { error: redErr } = await admin.from("referral_redemptions").insert({
        referee_user_id: user.id,
        referrer_user_id: referrerRow.id,
      });
      if (redErr && redErr.code !== "23505") {
        return NextResponse.json({ ok: false, error: redErr.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
