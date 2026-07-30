"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MIN_VISIBLE_MS = 220;
const FALLBACK_CLEAR_MS = 12_000;

/**
 * Thin top progress bar during client-side navigations so pages don’t feel stuck.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const pending = useRef(false);
  const startedAt = useRef(0);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (!pending.current) return;

    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => {
      pending.current = false;
      setActive(false);
    }, wait);

    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, [routeKey]);

  useEffect(() => {
    function isInternalNav(anchor: HTMLAnchorElement) {
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
      if (anchor.getAttribute("rel")?.includes("external")) return false;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return false;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        const nextKey = `${url.pathname}?${url.searchParams.toString()}`;
        const currentKey = `${window.location.pathname}?${new URLSearchParams(window.location.search).toString()}`;
        return nextKey !== currentKey;
      } catch {
        return false;
      }
    }

    function start() {
      pending.current = true;
      startedAt.current = Date.now();
      setActive(true);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      fallbackTimer.current = setTimeout(() => {
        pending.current = false;
        setActive(false);
      }, FALLBACK_CLEAR_MS);
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNav(anchor)) return;
      start();
    }

    function onPopState() {
      start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden"
      role="progressbar"
      aria-hidden={!active}
      aria-valuetext={active ? "Loading page" : undefined}
    >
      {active ? (
        <div className="nav-progress-bar h-full w-full bg-gradient-to-r from-glam-accent-deep via-glam-accent to-glam-accent-light" />
      ) : null}
    </div>
  );
}
