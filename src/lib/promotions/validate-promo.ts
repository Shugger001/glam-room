import type { SupabaseClient } from "@supabase/supabase-js";
import { BOOKING_DEPOSIT_GHS } from "@/lib/booking/deposit";

export type PromotionRow = {
  id: string;
  title: string;
  code: string | null;
  discount_percent: number | null;
  discount_amount: number | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export type PromoValidation = {
  valid: true;
  promotion: PromotionRow;
  baseDeposit: number;
  discountedDeposit: number;
  savings: number;
  label: string;
};

const MIN_DEPOSIT_GHS = 1;

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function isWithinSchedule(startsAt: string | null, endsAt: string | null, now = new Date()) {
  if (startsAt && now < new Date(startsAt)) return false;
  if (endsAt && now > new Date(endsAt)) return false;
  return true;
}

export function applyPromotionToDeposit(
  baseDeposit: number,
  promotion: Pick<PromotionRow, "discount_percent" | "discount_amount" | "title" | "code">,
): { discountedDeposit: number; savings: number; label: string } {
  let discounted = baseDeposit;
  let label = promotion.title;

  if (promotion.discount_percent != null && Number(promotion.discount_percent) > 0) {
    const pct = Number(promotion.discount_percent);
    discounted = Math.round(baseDeposit * (1 - pct / 100));
    label = `${promotion.code ?? promotion.title}: ${pct}% off deposit`;
  } else if (promotion.discount_amount != null && Number(promotion.discount_amount) > 0) {
    const off = Number(promotion.discount_amount);
    discounted = baseDeposit - off;
    label = `${promotion.code ?? promotion.title}: ₵${off} off deposit`;
  }

  discounted = Math.max(MIN_DEPOSIT_GHS, discounted);
  const savings = Math.max(0, baseDeposit - discounted);

  return { discountedDeposit: discounted, savings, label };
}

export async function validatePromotionCode(
  admin: SupabaseClient,
  rawCode: string,
  baseDeposit = BOOKING_DEPOSIT_GHS,
): Promise<{ valid: false; error: string } | PromoValidation> {
  const code = normalizeCode(rawCode);
  if (!code) return { valid: false, error: "Enter a promo code." };

  const { data, error } = await admin
    .from("promotions")
    .select("id, title, code, discount_percent, discount_amount, active, starts_at, ends_at")
    .eq("active", true)
    .ilike("code", code)
    .maybeSingle();

  if (error) return { valid: false, error: "Could not validate promo code." };
  if (!data || !data.code) return { valid: false, error: "Invalid or expired promo code." };

  if (!isWithinSchedule(data.starts_at, data.ends_at)) {
    return { valid: false, error: "This promo code is not active right now." };
  }

  const hasDiscount =
    (data.discount_percent != null && Number(data.discount_percent) > 0) ||
    (data.discount_amount != null && Number(data.discount_amount) > 0);

  if (!hasDiscount) {
    return { valid: false, error: "This promotion has no discount configured." };
  }

  const applied = applyPromotionToDeposit(baseDeposit, data);

  return {
    valid: true,
    promotion: data as PromotionRow,
    baseDeposit,
    discountedDeposit: applied.discountedDeposit,
    savings: applied.savings,
    label: applied.label,
  };
}

export type ResolvedPromo = {
  depositAmount: number;
  promotionCode: string;
  promoMeta: Record<string, unknown>;
};

export async function resolvePromoForBooking(
  admin: SupabaseClient,
  rawCode: string | undefined | null,
  baseDeposit = BOOKING_DEPOSIT_GHS,
): Promise<{ ok: true; promo: ResolvedPromo | null } | { ok: false; error: string }> {
  const code = rawCode?.trim();
  if (!code) return { ok: true, promo: null };

  const result = await validatePromotionCode(admin, code, baseDeposit);
  if (!result.valid) return { ok: false, error: result.error };

  return {
    ok: true,
    promo: {
      depositAmount: result.discountedDeposit,
      promotionCode: result.promotion.code!,
      promoMeta: {
        code: result.promotion.code,
        title: result.promotion.title,
        base_deposit: result.baseDeposit,
        discounted_deposit: result.discountedDeposit,
        savings: result.savings,
        label: result.label,
      },
    },
  };
}
