import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=80";

export function AboutPreview() {
  return (
    <Section id="about">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src={ABOUT_IMAGE}
            alt="The Glam Room salon experience"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-glam-primary/10" />
        </Reveal>
        <div>
          <SectionHeader
            eyebrow="About Us"
            title="A Sanctuary of Beauty"
            description="The Glam Room was born from a vision to create Accra's most refined hair and beauty destination — a space where exceptional artistry, premium products, and genuine care converge."
          />
          <Reveal delay={0.15}>
            <p className="mb-4 text-base leading-relaxed text-glam-muted">
              Our team of master stylists and beauty experts bring decades of combined experience
              across hair styling, wig artistry, protective styles, makeup, and bridal beauty.
              Every service is delivered with meticulous attention to detail.
            </p>
            <p className="mb-8 text-base leading-relaxed text-glam-muted">
              Step inside and experience the difference that luxury makes — from our serene salon
              atmosphere to the confidence you carry when you leave.
            </p>
            <ButtonLink href="/about" variant="outline">
              Our Story
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
