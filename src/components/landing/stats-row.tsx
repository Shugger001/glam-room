import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";

const STATS = [
  { value: "2", label: "Salon Locations" },
  { value: "15", label: "Services" },
  { value: "7", label: "Days Open Weekly" },
  { value: "8am–8pm", label: "Daily Hours" },
];

export function StatsRow() {
  return (
    <Section className="!py-12 sm:!py-16" background="white">
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} className="text-center">
            <p className="heading-display text-4xl text-glam-accent sm:text-5xl">{stat.value}</p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
