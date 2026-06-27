"use client";

import { AnimatePresence, m } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function MarketingMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const content = reducedMotion ? (
    children
  ) : (
    <AnimatePresence mode="wait">
      <m.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 flex-col"
      >
        {children}
      </m.div>
    </AnimatePresence>
  );

  return (
    <main
      id="main"
      className={cn(
        "flex flex-1 flex-col",
        !isHome && "pt-[calc(var(--header-height)+env(safe-area-inset-top,0px))]",
        isHome && "mobile-page-bottom md:pb-0",
      )}
    >
      {content}
    </main>
  );
}
