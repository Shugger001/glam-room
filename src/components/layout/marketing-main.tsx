"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function MarketingMain({ children }: { children: ReactNode }) {
  const isHome = usePathname() === "/";

  return (
    <main
      className={cn(
        "flex flex-1 flex-col",
        !isHome && "pt-[calc(var(--header-height)+env(safe-area-inset-top,0px))]",
        isHome && "mobile-page-bottom md:pb-0",
      )}
    >
      {children}
    </main>
  );
}
