import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";

const CTA_IMAGE = "/images/glam-red-celebration.png";

export function CtaBand() {
  return (
    <section
      id="book-cta"
      className="relative overflow-hidden bg-glam-primary"
      aria-labelledby="book-cta-heading"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={CTA_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-glam-primary/90 via-glam-primary/70 to-glam-primary/50" />
      </div>

      <div className="relative mx-auto flex min-h-[18rem] max-w-6xl flex-col justify-center px-5 py-16 sm:min-h-[22rem] sm:px-8 sm:py-24">
        <Reveal>
          <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-glam-accent">
            Glam Room
          </p>
          <h2
            id="book-cta-heading"
            className="heading-display mt-2 max-w-md text-4xl text-glam-secondary sm:text-5xl"
          >
            Ready for your chair?
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
            Adenta · Sowutuom · Madina
          </p>
          <div className="mt-8">
            <ButtonLink href="/book" variant="accent" size="lg" className="!rounded-none px-10">
              Book now
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
