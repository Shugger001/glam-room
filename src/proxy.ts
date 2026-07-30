import { NextRequest, NextResponse } from "next/server";
import { buildContentSecurityPolicy, staticSecurityHeaders } from "@/lib/security/headers";
import { updateSession } from "@/lib/supabase/middleware";

function needsSessionRefresh(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/account")
  );
}

/**
 * Keep Edge lean for Vercel size limits. Auth/role checks still happen in layouts/routes.
 * Session refresh runs only on auth-gated paths so cookies stay valid without bloating every request.
 *
 * Generates a per-request CSP nonce (no script-src unsafe-inline / unsafe-eval in production).
 * `/` gets strong no-store headers so the CDN never serves an old HTML/RSC shell.
 */
export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const csp = buildContentSecurityPolicy(nonce, isDev);
  const pathname = request.nextUrl.pathname;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Next.js reads CSP from the request to apply nonces to its scripts.
  requestHeaders.set("Content-Security-Policy", csp);

  if (pathname.startsWith("/admin")) {
    requestHeaders.set("x-glam-pathname", pathname);
    requestHeaders.set("x-glam-search", request.nextUrl.search);
  }

  const requestWithHeaders = new NextRequest(request, { headers: requestHeaders });

  const res = needsSessionRefresh(pathname)
    ? await updateSession(requestWithHeaders)
    : NextResponse.next({ request: { headers: requestHeaders } });

  res.headers.set("Content-Security-Policy", csp);
  for (const header of staticSecurityHeaders) {
    res.headers.set(header.key, header.value);
  }

  if (pathname === "/") {
    res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
    res.headers.set("CDN-Cache-Control", "no-store");
    res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  }

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/account")
  ) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets Next serves directly.
     * CSP nonces must run on HTML/document responses.
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|txt|xml|webmanifest)$).*)",
    },
  ],
};
