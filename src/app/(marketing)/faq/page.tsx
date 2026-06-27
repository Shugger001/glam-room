import type { Metadata } from "next";
import { FaqAccordion } from "@/components/landing/faq-section";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/components/landing/cta-band";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { BRAND } from "@/lib/constants/brand";
import { getLiveFaqs } from "@/lib/data/live-site-content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Help",
  description: `Frequently asked questions about booking, deposits, braids, and visits at ${BRAND.fullName}.`,
};

export default async function FaqPage() {
  const faqs = await getLiveFaqs();

  return (
    <>
      <FaqJsonLd items={faqs} />
      <PageHero eyebrow="Help" title="Common questions" description="Booking, prices, and visits." />
      <Section background="white" className="!pt-0">
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={faqs} />
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
