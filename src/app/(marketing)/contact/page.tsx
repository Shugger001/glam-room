import type { Metadata } from "next";
import { ContactSection } from "@/components/landing/contact-section";
import { PageHero } from "@/components/marketing/page-hero";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import { getLiveLocations } from "@/lib/data/live-site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: `WhatsApp or message ${BRAND.fullName}.`,
};

export default async function ContactPage() {
  const locations = await getLiveLocations();

  return (
    <>
      <PageHero eyebrow="Contact" title="Get in touch" description="WhatsApp us or send a message." />
      <ContactSection locations={locations} />
      <CtaBand />
    </>
  );
}
