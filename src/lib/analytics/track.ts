"use client";

import posthog from "posthog-js";

type EventPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;
  const body = { event, ...payload };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(body);
  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    try {
      posthog.capture(event, payload);
    } catch {
      /* PostHog not initialized */
    }
  }
}
