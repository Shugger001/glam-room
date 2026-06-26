function trimSlash(s: string) {
  return s.replace(/\/+$/, "");
}

/**
 * Builds a public URL for marketing imagery.
 *
 * Order:
 * 1. `NEXT_PUBLIC_MEDIA_CDN_BASE` + path (any CDN mirroring the same keys)
 * 2. `NEXT_PUBLIC_SUPABASE_URL` + `/storage/v1/object/public/` + `NEXT_PUBLIC_MEDIA_BUCKET` + path
 *
 * Upload to Supabase Storage (public bucket) using the same paths as in `editorial-media.ts`
 * (e.g. `editorial/hero.webp`, `editorial/gallery-01.webp`).
 *
 * Remote URLs are used only when `NEXT_PUBLIC_MARKETING_MEDIA_USE_STORAGE` is `true`; otherwise
 * callers fall back to Unsplash / local placeholders.
 */
function remoteMarketingMediaEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_MARKETING_MEDIA_USE_STORAGE?.trim().toLowerCase();
  return flag === "true" || flag === "1" || flag === "on";
}

export function publicMarketingMediaUrl(objectPath: string): string | null {
  if (!remoteMarketingMediaEnabled()) return null;

  const clean = objectPath.replace(/^\/+/, "");
  const cdnBase = process.env.NEXT_PUBLIC_MEDIA_CDN_BASE?.trim();
  if (cdnBase) {
    return `${trimSlash(cdnBase)}/${clean}`;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const bucket = process.env.NEXT_PUBLIC_MEDIA_BUCKET?.trim() || "site-media";
  if (!supabaseUrl) return null;
  return `${trimSlash(supabaseUrl)}/storage/v1/object/public/${bucket}/${clean}`;
}

export function publicMarketingSrc(objectPath: string, fallbackUrl: string): string {
  return publicMarketingMediaUrl(objectPath) ?? fallbackUrl;
}
