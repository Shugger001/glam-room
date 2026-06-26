import type { NextConfig } from "next";
import path from "path";
import withPWAInit from "@ducanh2912/next-pwa";

/**
 * Do not run next-pwa at all unless explicitly enabled. Wrapping with `disable: true` still
 * risked registration/caching edge cases; skipping the plugin entirely avoids generating `sw.js`.
 *
 * Set `NEXT_PUBLIC_ENABLE_PWA=true` on Vercel only if you need install/offline (then tune Workbox).
 */
const enablePwa =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_PWA === "true";

const baseConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" }],
      },
    ];
  },
};

const nextConfig: NextConfig = enablePwa
  ? withPWAInit({
      dest: "public",
      disable: false,
      register: true,
      cacheStartUrl: false,
      fallbacks: {
        document: "/offline",
      },
    })(baseConfig)
  : baseConfig;

export default nextConfig;
