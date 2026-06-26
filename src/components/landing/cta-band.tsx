import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";

export function CtaBand() {
  return (
    <Section id="contact" background="dark" className="relative !py-16 sm:!py-24">
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-glam-accent/20 bg-white/[0.03] px-6 py-12 text-center shadow-[var(--shadow-gold)] backdrop-blur-sm sm:px-12 sm:py-16">
        <p className="eyebrow-label text-glam-accent">Come Through, Sis</p>
        <span className="gold-rule mx-auto" aria-hidden />
        <h2 className="heading-display mt-6 text-4xl text-glam-secondary sm:text-5xl">
          Book Your Glow Up
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-white/60">
          Three Glam Room shops in Accra. Pick your location, choose your service, and come shine.
        </p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <ButtonLink href="/book" variant="accent" size="lg" className="w-full justify-center sm:w-auto">
            Book Appointment
          </ButtonLink>
          <ButtonLink
            href={BRAND.links.whatsapp}
            variant="outline"
            size="lg"
            className="w-full justify-center border-white/25 text-glam-secondary hover:border-glam-accent hover:text-glam-accent sm:w-auto"
          >
            WhatsApp Us
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  );
}
