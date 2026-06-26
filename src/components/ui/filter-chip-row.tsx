import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function FilterChipRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
