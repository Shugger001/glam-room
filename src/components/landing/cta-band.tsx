import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export function CtaBand() {
  return (
    <Section background="accent" className="!py-16 sm:!py-20">
      <Reveal className="flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-glam-accent">
          Ready to Transform?
        </p>
        <h2 className="heading-display mt-4 max-w-2xl text-4xl text-glam-primary sm:text-5xl">
          Your Next Look Awaits
        </h2>
        <p className="mt-4 max-w-lg text-base text-glam-muted">
          Book your appointment today and experience the luxury that sets The Glam Room apart.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/book" variant="primary" size="lg">
            Book Appointment
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" size="lg">
            Contact Us
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  );
}
