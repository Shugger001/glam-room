"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { Toaster } from "sonner";
import { PostHogInit } from "@/components/analytics/posthog-init";
import { ClearStalePwa } from "@/components/pwa/clear-stale-pwa";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <ClearStalePwa />
      <PostHogInit />
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "font-sans border border-[#F8C8DC]/40 bg-white/95 shadow-lg backdrop-blur-md",
            title: "text-[#0A1A2F]",
            description: "text-[#0A1A2F]/70",
          },
        }}
      />
    </LazyMotion>
  );
}
