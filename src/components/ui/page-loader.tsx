import Image from "next/image";
import { BRAND } from "@/lib/constants/brand";

type PageLoaderProps = {
  /** Short status for screen readers and optional visible label */
  label?: string;
  /** Compact variant for nested dashboard panels */
  compact?: boolean;
  /** Light text/logo treatment for dark admin shells */
  tone?: "light" | "dark";
};

/**
 * Branded full-area loading state for Next.js `loading.tsx` and suspense fallbacks.
 */
export function PageLoader({
  label = "Loading…",
  compact = false,
  tone = "light",
}: PageLoaderProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={
        compact
          ? "flex min-h-[12rem] flex-col items-center justify-center gap-4 px-6 py-12"
          : "flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-6 px-6 py-16"
      }
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative">
          <span
            className={`page-loader-ring absolute inset-[-10px] rounded-full border-2 border-t-glam-accent ${
              isDark ? "border-white/20" : "border-glam-accent/25"
            }`}
            aria-hidden
          />
          <div
            className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full shadow-glass ring-1 ${
              isDark ? "bg-white/10 ring-white/15" : "bg-white ring-glam-border"
            }`}
          >
            <Image
              src={BRAND.logo.mark}
              alt=""
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
        </div>
        <div className="text-center">
          <p
            className={`font-display text-xl tracking-wide ${
              isDark ? "text-white" : "text-glam-primary"
            }`}
          >
            {BRAND.name}
          </p>
          <p className={`mt-1 text-sm ${isDark ? "text-white/60" : "text-glam-muted"}`}>{label}</p>
        </div>
      </div>
    </div>
  );
}
