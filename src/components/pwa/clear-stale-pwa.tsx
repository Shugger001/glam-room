"use client";

import { useEffect } from "react";

const CACHE_PREFIXES = ["pages", "start-url", "workbox", "next-static-js", "next-data"];

function shouldDeleteCache(name: string): boolean {
  const n = name.toLowerCase();
  return CACHE_PREFIXES.some((p) => n.includes(p));
}

/**
 * When PWA is off (default): unregister every service worker and drop Workbox/navigation caches
 * so older installs cannot keep serving stale HTML or JS (e.g. old testimonial names).
 */
export function ClearStalePwa() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_PWA === "true") return;
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => {
          void r.unregister();
        });
      });
    }

    if ("caches" in window) {
      void caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (shouldDeleteCache(key)) void caches.delete(key);
        });
      });
    }
  }, []);

  return null;
}
