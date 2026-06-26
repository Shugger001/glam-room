"use client";

import { m, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, label, summary";

export function LuxuryCursor() {
  const pathname = usePathname();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 380, damping: 30, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 380, damping: 30, mass: 0.35 });
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const disabled =
    pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/account");

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(finePointer.matches && !reducedMotion.matches);
    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled || disabled) return;

    const move = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };

    const hide = () => setVisible(false);
    const show = () => setVisible(true);

    const onPointerOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) setHovering(true);
    };

    const onPointerOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const related = event.relatedTarget as HTMLElement | null;
      if (target?.closest(INTERACTIVE_SELECTOR) && !related?.closest(INTERACTIVE_SELECTOR)) {
        setHovering(false);
      }
    };

    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", hide);
    document.documentElement.addEventListener("mouseenter", show);
    document.addEventListener("mouseover", onPointerOver);
    document.addEventListener("mouseout", onPointerOut);

    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.documentElement.removeEventListener("mouseenter", show);
      document.removeEventListener("mouseover", onPointerOver);
      document.removeEventListener("mouseout", onPointerOut);
    };
  }, [disabled, enabled, x, y]);

  if (!enabled || disabled) return null;

  return (
    <m.div
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden md:block"
      style={{ x: springX, y: springY }}
      aria-hidden
    >
      <m.div
        className="-translate-x-1/2 -translate-y-1/2"
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <m.div
          animate={{
            width: hovering ? 52 : 34,
            height: hovering ? 52 : 34,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="rounded-full border border-glam-accent/70 bg-glam-accent/5 shadow-[0_0_24px_rgba(200,168,107,0.25)]"
        />
        <m.div
          animate={{ scale: hovering ? 0 : 1, opacity: hovering ? 0 : 1 }}
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-glam-accent"
        />
      </m.div>
    </m.div>
  );
}
