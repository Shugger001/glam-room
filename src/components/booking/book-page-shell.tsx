import type { ReactNode } from "react";

type BookPageShellProps = {
  children: ReactNode;
};

export function BookPageShell({ children }: BookPageShellProps) {
  return (
    <div className="relative min-h-[100dvh] bg-glam-background-warm">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-glam-accent/10 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 px-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-8 sm:pt-10 sm:pb-16">
        <div className="container-wide">{children}</div>
      </div>
    </div>
  );
}
