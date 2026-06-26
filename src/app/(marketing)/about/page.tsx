import type { Metadata } from "next";
import Image from "next/image";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { BRAND } from "@/lib/constants/brand";

const ABOUT_HERO =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&q=80";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${BRAND.fullName} — Accra's premier luxury hair and beauty salon.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="relative -mt-[var(--header-height)] flex min-h-[50vh] items-end bg-glam-primary">
        <Image
          src={ABOUT_HERO}
          alt="The Glam Room salon"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-glam-primary via-glam-primary/60 to-transparent" />
        <div className="container-narrow relative z-10 px-5 pb-16 pt-32 sm:px-8">
          <h1 className="heading-display text-5xl text-glam-secondary sm:text-6xl">Our Story</h1>
          <p className="mt-4 max-w-xl text-lg text-white/70">
            A sanctuary where luxury meets artistry.
          </p>
        </div>
      </section>

      <Section>
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
        <SectionHeader
          eyebrow="Our Values"
          title="What We Stand For"
          align="center"
        />
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
