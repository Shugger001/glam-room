"use client";

import { m, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

const BOOKING_BG = "/images/glam-booking-bg.png";

type BookPageShellProps = {
  children: ReactNode;
};

export function BookPageShell({ children }: BookPageShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: shellRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.12]);

  return (
    <div
      ref={shellRef}
      className="relative -mt-[calc(var(--header-height)+env(safe-area-inset-top,0px))] min-h-[100svh] overflow-hidden bg-glam-primary"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <m.div className="absolute inset-0 origin-center" style={{ y: bgY, scale: bgScale }}>
          <Image
            src={BOOKING_BG}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_15%] opacity-90 sm:object-[center_20%]"
          />
        </m.div>
        <div className="absolute inset-0 bg-gradient-to-b from-glam-primary/75 via-glam-primary/55 to-glam-primary/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-glam-primary/25 via-transparent to-glam-primary/45" />
      </div>

      <div className="relative z-10 section-padding pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1.5rem)] sm:pt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+2.5rem)]">
        <div className="container-wide">{children}</div>
      </div>
    </div>
  );
}
