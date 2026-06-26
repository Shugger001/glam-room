"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type CountUpProps = {
  value: number;
  active: boolean;
  className?: string;
};

export function CountUp({ value, active, className }: CountUpProps) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const duration = 1400;
    const startAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    setDisplay(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return (
    <span className={className} aria-label={String(value)}>
      {display}
    </span>
  );
}

type CountUpOnViewProps = {
  value: number;
  className?: string;
};

/** Self-contained counter that observes its own box (no transformed parents). */
export function CountUpOnView({ value, className }: CountUpOnViewProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <span ref={ref} className={className}>
      <CountUp value={value} active={inView} />
    </span>
  );
}
