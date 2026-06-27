"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants/brand";

const ROTATING_LINES = [
  BRAND.copy.heroSubtitle,
  "Braids, installs & silk presses, done right.",
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
    <div className="relative mx-auto mt-6 min-h-[5rem] w-full max-w-xl px-2 sm:min-h-[3.5rem]">
      <AnimatePresence mode="wait">
        <m.p
          key={ROTATING_LINES[index]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-2 top-1/2 -translate-y-1/2 text-center text-base font-light leading-relaxed tracking-wide text-white/75 sm:text-lg"
        >
          {ROTATING_LINES[index]}
        </m.p>
      </AnimatePresence>
    </div>
  );
}
