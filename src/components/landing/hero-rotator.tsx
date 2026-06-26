"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants/brand";

const ROTATING_LINES = [
  BRAND.copy.heroSubtitle,
  "Braids, installs & silk presses — done right.",
  "Three Accra locations. One glam standard.",
];

export function HeroRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % ROTATING_LINES.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative mt-6 h-[4.5rem] max-w-lg sm:h-[3.5rem]">
      <AnimatePresence mode="wait">
        <m.p
          key={ROTATING_LINES[index]}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 text-base leading-relaxed text-white/70 sm:text-lg"
        >
          {ROTATING_LINES[index]}
        </m.p>
      </AnimatePresence>
    </div>
  );
}
