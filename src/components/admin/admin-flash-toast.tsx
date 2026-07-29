"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AdminFlashToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    const flash = params.get("flash");
    const msg = params.get("msg");
    if (!flash || !msg) return;

    const key = `${flash}:${msg}`;
    if (handled.current === key) return;
    handled.current = key;

    if (flash === "success") toast.success(msg);
    else toast.error(msg);

    const next = new URLSearchParams(params.toString());
    next.delete("flash");
    next.delete("msg");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  return null;
}
