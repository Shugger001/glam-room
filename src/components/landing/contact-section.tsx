import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";
import { SALON_LOCATIONS, type SalonLocation } from "@/lib/constants/locations";

export function ContactSection({ locations = SALON_LOCATIONS }: { locations?: SalonLocation[] }) {
  return (
    <Section id="contact" background="white">
      <SectionHeader
        eyebrow="Contact"
        title="Contact us"
        description="WhatsApp or send a message."
        align="center"
      />
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <Reveal>
          <ContactForm />
        </Reveal>
        <Reveal delay={0.1} className="space-y-6">
          <div className="rounded-2xl border border-glam-border bg-glam-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
              WhatsApp
            </p>
            <p className="mt-2 text-sm text-glam-muted">Fastest way to book.</p>
            <ButtonLink href={BRAND.links.whatsapp} variant="accent" className="mt-4 w-full sm:w-auto">
              WhatsApp
            </ButtonLink>
          </div>
          <div className="rounded-2xl border border-glam-border bg-glam-background p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
              Locations
            </p>
            <ul className="mt-4 space-y-4 text-sm text-glam-muted">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <p className="font-medium text-glam-primary">{loc.area}</p>
                  <p>{loc.address}</p>
                  <p className="text-xs">{loc.hours}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-glam-border bg-glam-background p-6 text-sm text-glam-muted">
            <p className="font-medium text-glam-primary">{BRAND.links.phone}</p>
            <p className="mt-1">{BRAND.links.email}</p>
            <p className="mt-3">Mon to Sun · 8am to 8pm</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
