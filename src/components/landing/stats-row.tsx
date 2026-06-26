"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { CountUp } from "@/components/motion/count-up";
import { SalonOpenStatus } from "@/components/landing/salon-open-status";
import { Section } from "@/components/ui/section";

type StatsRowProps = {
  locationCount: number;
  serviceCount: number;
  testimonialCount: number;
};

export function StatsRow({ locationCount, serviceCount, testimonialCount }: StatsRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <Section className="!py-12 sm:!py-16" background="white">
      <div ref={ref} className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        <div className="text-center">
          <p className="heading-display text-4xl text-glam-accent sm:text-5xl">
            <CountUp value={locationCount} active={inView} />
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Salon Locations
          </p>
        </div>
        <div className="text-center">
          <p className="heading-display text-4xl text-glam-accent sm:text-5xl">
            <CountUp value={serviceCount} active={inView} />
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Live Services
          </p>
        </div>
        <div className="text-center">
          <p className="heading-display text-4xl text-glam-accent sm:text-5xl">
            <CountUp value={testimonialCount} active={inView} />
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Client Love Notes
          </p>
        </div>
        <SalonOpenStatus variant="stat" />
      </div>
    </Section>
  );
}
