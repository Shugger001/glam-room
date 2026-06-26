import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";

export function CtaBand() {
  return (
    <Section background="accent" className="!py-16 sm:!py-20">
      <Reveal className="flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-glam-accent">
          Come Through, Sis
        </p>
        <h2 className="heading-display mt-4 max-w-2xl text-4xl text-glam-primary sm:text-5xl">
          Book Your Glow Up
        </h2>
        <p className="mt-4 max-w-lg text-base text-glam-muted">
          Three Glam Room shops in Accra. Pick your location, choose your service, and come shine.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/book" variant="primary" size="lg">
            Book Appointment
          </ButtonLink>
          <ButtonLink href={BRAND.links.whatsapp} variant="outline" size="lg">
            WhatsApp Us
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  );
}
