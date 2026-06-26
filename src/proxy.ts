import { type NextRequest, NextResponse } from "next/server";

/**
 * Keep Edge minimal for Vercel size limits. Auth/role checks happen server-side in layouts/routes.
 * Scope proxy only to auth-sensitive surfaces.
 *
 * `/` gets strong no-store headers so the CDN never serves an old HTML/RSC shell (stale testimonials).
 */
export function proxy(request: NextRequest) {
  const res = NextResponse.next();

  if (request.nextUrl.pathname === "/") {
    res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
    res.headers.set("CDN-Cache-Control", "no-store");
    res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/account/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/api/auth/:path*",
    "/api/paystack/:path*",
  ],
};
