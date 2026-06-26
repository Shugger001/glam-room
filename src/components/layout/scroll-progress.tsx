"use client";

import { m, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  return (
    <m.div
      className="pointer-events-none fixed inset-x-0 top-[calc(var(--header-height)+env(safe-area-inset-top,0px))] z-[60] h-0.5 origin-left bg-glam-accent"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
