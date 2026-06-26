import type { Metadata } from "next";
import Image from "next/image";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/motion/reveal";
import { BRAND } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${BRAND.fullName} — Accra's premier hair destination with locations in Adenta, Sowutuom, and Madina.`,
};

export default function AboutPage() {
  return (
    <>
      <Section className="!pt-12">
        <SectionHeader
          eyebrow="The Glam Room"
          title="The Art of Transformation"
          description={BRAND.copy.heroTagline}
          align="center"
        />
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="/images/asantewaa-gown-smile.png"
              alt="Asantewaa at Glam Room"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <div className="space-y-6 text-base leading-relaxed text-glam-muted">
            {BRAND.copy.aboutIntro.map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 24)} delay={i * 0.1}>
                <p>{paragraph}</p>
              </Reveal>
            ))}
            <Reveal delay={0.2}>
              <blockquote className="border-l-2 border-glam-accent pl-4 italic text-glam-primary">
                &ldquo;{BRAND.copy.quote}&rdquo;
                <footer className="mt-2 text-sm font-semibold not-italic text-glam-accent">
                  — {BRAND.copy.quoteAuthor}
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section background="white">
        <SectionHeader eyebrow="The Queen Behind the Chair" title="Meet Asantewaa" align="center" />
        <Reveal className="mx-auto max-w-3xl text-center text-base leading-relaxed text-glam-muted">
          <p>
            Glam Room is her love letter to Accra: warm vibes, expert hands, and zero tolerance for
            bad hair days. Whether you&apos;re coming for a silk press or a full transformation,
            you&apos;re family here.
          </p>
        </Reveal>
      </Section>
    </>
  );
}
