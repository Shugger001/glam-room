import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";

export function CtaBand() {
  return (
    <Section id="book-cta" background="dark" className="relative !py-12 sm:!py-16">
      <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-glam-accent/20 bg-white/[0.03] px-6 py-10 text-center sm:px-10">
        <h2 className="heading-display text-3xl text-glam-secondary sm:text-4xl">Ready to book?</h2>
        <p className="mt-3 text-sm text-white/60">Adenta · Sowutuom · Madina</p>
        <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/book" variant="accent" size="lg" className="w-full justify-center sm:w-auto">
            Book Now
          </ButtonLink>
          <ButtonLink
            href={BRAND.links.whatsapp}
            variant="outline"
            size="lg"
            className="w-full justify-center border-white/25 text-glam-secondary hover:border-glam-accent sm:w-auto"
          >
            WhatsApp
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  );
}
