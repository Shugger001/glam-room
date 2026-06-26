"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function MarketingMain({ children }: { children: ReactNode }) {
  const isHome = usePathname() === "/";

  return (
    <main className={cn("flex flex-1 flex-col", !isHome && "pt-[var(--header-height)]")}>
      {children}
    </main>
  );
}
