import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";

const ABOUT_IMAGE = "/images/asantewaa-gown-smile.png";

export function AboutPreview() {
  return (
    <Section id="about">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-premium">
          <Image
            src={ABOUT_IMAGE}
            alt="Asantewaa at Glam Room by Asantewaa"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />
          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-glam-accent/20" />
        </Reveal>
        <div>
          <SectionHeader
            eyebrow="The Glam Room"
            title="The Art of Transformation"
            description={BRAND.copy.aboutIntro[0]}
          />
          <Reveal delay={0.15}>
            <p className="mb-4 text-base leading-relaxed text-glam-muted">
              {BRAND.copy.aboutIntro[1]}
            </p>
            <blockquote className="mb-8 border-l border-glam-accent/60 pl-5 text-lg italic leading-relaxed text-glam-primary">
              &ldquo;{BRAND.copy.quote}&rdquo;
              <footer className="mt-3 text-sm font-semibold not-italic tracking-wide text-glam-accent">
                — {BRAND.copy.quoteAuthor}
              </footer>
            </blockquote>
            <ButtonLink href="/#about" variant="outline">
              Our Story
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
