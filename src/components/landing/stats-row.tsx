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
    <Section className="relative !py-12 sm:!py-16" background="white">
      <div
        ref={ref}
        className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4 lg:divide-x lg:divide-glam-accent/15"
      >
        <div className="text-center lg:px-6">
          <p className="heading-display text-3xl sm:text-4xl lg:text-5xl">
            <CountUp value={locationCount} active={inView} className="text-gold-gradient" />
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Salon Locations
          </p>
        </div>
        <div className="text-center lg:px-6">
          <p className="heading-display text-3xl sm:text-4xl lg:text-5xl">
            <CountUp value={serviceCount} active={inView} className="text-gold-gradient" />
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Live Services
          </p>
        </div>
        <div className="text-center lg:px-6">
          <p className="heading-display text-3xl sm:text-4xl lg:text-5xl">
            <CountUp value={testimonialCount} active={inView} className="text-gold-gradient" />
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Client Love Notes
          </p>
        </div>
        <SalonOpenStatus variant="stat" className="col-span-2 lg:col-span-1 lg:px-6" />
      </div>
    </Section>
  );
}
