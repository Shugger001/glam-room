import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { SalonOpenStatus } from "@/components/landing/salon-open-status";
import { Section } from "@/components/ui/section";

type StatsRowProps = {
  locationCount: number;
  serviceCount: number;
  testimonialCount: number;
};

export function StatsRow({ locationCount, serviceCount, testimonialCount }: StatsRowProps) {
  return (
    <Section className="!py-12 sm:!py-16" background="white">
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        <Reveal delay={0} className="text-center">
          <p className="heading-display text-4xl text-glam-accent sm:text-5xl">
            <CountUp value={locationCount} />
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Salon Locations
          </p>
        </Reveal>
        <Reveal delay={0.08} className="text-center">
          <p className="heading-display text-4xl text-glam-accent sm:text-5xl">
            <CountUp value={serviceCount} />
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Live Services
          </p>
        </Reveal>
        <Reveal delay={0.16} className="text-center">
          <p className="heading-display text-4xl text-glam-accent sm:text-5xl">
            <CountUp value={testimonialCount} />
          </p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Client Love Notes
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <SalonOpenStatus variant="stat" />
        </Reveal>
      </div>
    </Section>
  );
}
