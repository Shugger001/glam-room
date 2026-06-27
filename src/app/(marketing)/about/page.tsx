import type { Metadata } from "next";
import { AboutPreview } from "@/components/landing/about-preview";
import { LocationsPreview } from "@/components/landing/locations-preview";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "About",
  description: `${BRAND.fullName} — luxury hair and beauty in Accra, founded by Asantewaa.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="The Art of Transformation"
        description={BRAND.copy.aboutIntro[0]}
      />
      <AboutPreview />
      <Section background="white">
        <Reveal className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-glam-muted">
          <p>{BRAND.copy.aboutIntro[1]}</p>
          <blockquote className="border-l border-glam-accent/60 pl-5 text-lg italic text-glam-primary">
            &ldquo;{BRAND.copy.quote}&rdquo;
            <footer className="mt-3 text-sm font-semibold not-italic text-glam-accent">
              — {BRAND.copy.quoteAuthor}
            </footer>
          </blockquote>
          <p>{BRAND.parentBrand} brings editorial-level care to everyday glam — three shops, one standard.</p>
          <ButtonLink href="/book" variant="accent">
            Book Your Visit
          </ButtonLink>
        </Reveal>
      </Section>
      <LocationsPreview />
      <CtaBand />
    </>
  );
}
