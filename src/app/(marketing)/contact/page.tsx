import type { Metadata } from "next";
import { ContactSection } from "@/components/landing/contact-section";
import { PageHero } from "@/components/marketing/page-hero";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${BRAND.fullName} — WhatsApp, email, or message our team in Adenta, Sowutuom, or Madina.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We'd Love to Hear From You"
        description="Send a message, WhatsApp Asantewaa's team, or book directly online."
      />
      <ContactSection />
      <CtaBand />
    </>
  );
}
