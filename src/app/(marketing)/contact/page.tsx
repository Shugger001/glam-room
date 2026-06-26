import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { ContactForm } from "@/components/contact/contact-form";
import { BRAND } from "@/lib/constants/brand";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${BRAND.fullName}. Book or visit us in Adenta or Sowutuom, Accra.`,
};

export default function ContactPage() {
  return (
    <Section className="!pt-10">
      <SectionHeader
        eyebrow="Get In Touch"
        title="Come Through, Sis"
        description="Two Glam Room spots in Accra. Pick your location when you book."
        align="center"
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          {SALON_LOCATIONS.map((location, i) => (
            <Reveal key={location.id} delay={i * 0.1}>
              <div className="overflow-hidden rounded-2xl border border-glam-border bg-glam-secondary">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={location.image}
                    alt={`Glam Room ${location.area}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-glam-accent">
                    Glam Room · {location.area}
                  </h3>
                  <p className="mt-2 text-glam-primary">{location.address}</p>
                  <p className="mt-2 text-sm text-glam-muted">{location.hours}</p>
                  <Link
                    href={location.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-glam-accent hover:underline"
                  >
                    View on Google Maps →
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-glam-border bg-glam-secondary p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-glam-accent">
                Follow Asantewaa
              </h3>
              <p className="mt-2 text-sm text-glam-muted">
                Stay connected for daily slay inspiration and salon updates.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href={BRAND.links.whatsapp} target="_blank" rel="noreferrer" className="text-glam-primary hover:text-glam-accent">
                    WhatsApp: {BRAND.links.phone}
                  </a>
                </li>
                <li>
                  <a href={BRAND.links.instagram} target="_blank" rel="noreferrer" className="text-glam-primary hover:text-glam-accent">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href={BRAND.links.tiktok} target="_blank" rel="noreferrer" className="text-glam-primary hover:text-glam-accent">
                    TikTok
                  </a>
                </li>
                <li>
                  <a href={BRAND.links.youtube} target="_blank" rel="noreferrer" className="text-glam-primary hover:text-glam-accent">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
