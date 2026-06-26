import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { BRAND } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${BRAND.fullName} — Accra's premier luxury hair and beauty salon.`,
};

export default function AboutPage() {
  return (
    <>
      <Section className="!pt-12">
        <SectionHeader
          eyebrow="About Us"
          title="Our Story"
          description="A sanctuary where luxury meets artistry."
          align="center"
        />
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-glam-muted">
          <Reveal>
            <p>
              The Glam Room was founded with a singular vision: to create Accra&apos;s most refined
              destination for hair and beauty. We believed that every client deserves an experience
              that feels as exceptional as the results they receive.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              From our carefully curated salon atmosphere to our team of master stylists, every
              detail has been considered. We source premium products, invest in continuous
              education, and maintain the highest standards of hygiene and professionalism.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p>
              Whether you&apos;re preparing for your wedding day, refreshing your everyday look, or
              transforming with a bold new style — The Glam Room is where your beauty journey
              begins.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section background="white">
        <SectionHeader eyebrow="Our Values" title="What We Stand For" align="center" />
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Excellence",
              text: "Uncompromising quality in every service, every time.",
            },
            {
              title: "Care",
              text: "Your comfort, confidence, and hair health come first.",
            },
            {
              title: "Artistry",
              text: "Creative vision paired with technical mastery.",
            },
          ].map((value, i) => (
            <Reveal key={value.title} delay={i * 0.1} className="text-center">
              <h3 className="heading-display text-2xl text-glam-primary">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-glam-muted">{value.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
