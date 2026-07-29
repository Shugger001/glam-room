import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AdminFlashType = "success" | "error";

export function withAdminFlash(
  path: string,
  type: AdminFlashType,
  msg: string,
): string {
  const [base, existing = ""] = path.split("?");
  const qs = new URLSearchParams(existing);
  qs.set("flash", type);
  qs.set("msg", msg);
  return `${base}?${qs.toString()}`;
}

/** Redirect to an admin path with a one-shot toast query. */
export function redirectWithFlash(
  path: string,
  type: AdminFlashType,
  msg: string,
): never {
  redirect(withAdminFlash(path, type, msg));
}

/** Prefer the referring admin page; fall back to `fallback`. */
export async function redirectBackWithFlash(
  type: AdminFlashType,
  msg: string,
  fallback = "/admin/appointments",
): Promise<never> {
  const h = await headers();
  const referer = h.get("referer");
  let path = fallback;
  if (referer) {
    try {
      const u = new URL(referer);
      if (u.pathname.startsWith("/admin")) {
        path = `${u.pathname}${u.search}`;
      }
    } catch {
      // keep fallback
    }
  }
  redirectWithFlash(path, type, msg);
}
