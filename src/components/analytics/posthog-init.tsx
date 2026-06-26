"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
    if (!key) return;
    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  return null;
}
