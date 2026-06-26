import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { ContactForm } from "@/components/contact/contact-form";
import { BRAND } from "@/lib/constants/brand";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${BRAND.fullName}. Book, enquire, or visit us in ${BRAND.address.city}.`,
};

const mapEmbedUrl = `https://maps.google.com/maps?q=${BRAND.address.lat},${BRAND.address.lng}&z=15&output=embed`;

export default function ContactPage() {
  return (
    <Section className="!pt-28">
      <SectionHeader
        eyebrow="Contact"
        title="Get in Touch"
        description="We'd love to hear from you. Reach out for bookings, enquiries, or just to say hello."
        align="center"
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <Reveal>
            <div className="rounded-2xl border border-glam-border bg-glam-secondary p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-glam-accent">
                Visit Us
              </h3>
              <p className="mt-3 text-glam-primary">
                {BRAND.address.street}
                <br />
                {BRAND.address.city}, {BRAND.address.country}
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${BRAND.address.street}, ${BRAND.address.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-medium text-glam-accent hover:underline"
              >
                Get Directions →
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-glam-border bg-glam-secondary p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-glam-accent">
                Business Hours
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-glam-muted">
                {BRAND.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span>{h.closed ? "Closed" : `${h.open} – ${h.close}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-glam-border bg-glam-secondary p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-glam-accent">
                Connect
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href={`mailto:${BRAND.links.email}`} className="text-glam-primary hover:text-glam-accent">
                    {BRAND.links.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${BRAND.links.phone.replace(/\s/g, "")}`} className="text-glam-primary hover:text-glam-accent">
                    {BRAND.links.phone}
                  </a>
                </li>
                <li>
                  <a href={BRAND.links.whatsapp} target="_blank" rel="noreferrer" className="text-glam-primary hover:text-glam-accent">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href={BRAND.links.instagram} target="_blank" rel="noreferrer" className="text-glam-primary hover:text-glam-accent">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href={BRAND.links.facebook} target="_blank" rel="noreferrer" className="text-glam-primary hover:text-glam-accent">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.3} className="overflow-hidden rounded-2xl">
            <iframe
              title="The Glam Room location"
              src={mapEmbedUrl}
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
