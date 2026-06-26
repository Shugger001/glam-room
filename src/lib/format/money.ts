import { MARKET } from "@/lib/constants/market";

/** Whole cedis (shop, booking display). */
export function formatShopPrice(amount: number): string {
  const n = amount.toLocaleString("en-GH", { maximumFractionDigits: 0 });
  return `${MARKET.currencySymbol}${n}`;
}
