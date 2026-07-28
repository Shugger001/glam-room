/** Shared HTTP security headers for Next.js. */

export function buildContentSecurityPolicy(nonce: string, isDev: boolean) {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    // Dev tooling (React Refresh / webpack eval). Omitted in production.
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // Tailwind / Next inline styles still need this; scanners warn on script-src only.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://*.paystack.co https://vitals.vercel-insights.com https://*.vercel-insights.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.i.posthog.com https://us.i.posthog.com https://eu.i.posthog.com https://vercel.live wss://ws-us3.pusher.com",
    "frame-src 'self' https://js.paystack.co https://checkout.paystack.com https://*.paystack.com https://vercel.live",
    "worker-src 'self' blob:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ]
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Non-CSP headers — safe to set statically in next.config. */
export const staticSecurityHeaders: { key: string; value: string }[] = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(self)",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

/** @deprecated Use staticSecurityHeaders + buildContentSecurityPolicy(nonce). */
export const securityHeaders = staticSecurityHeaders;
