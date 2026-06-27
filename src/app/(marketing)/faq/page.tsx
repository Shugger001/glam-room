import type { Metadata } from "next";
import { FaqAccordion } from "@/components/landing/faq-section";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/components/landing/cta-band";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { BRAND } from "@/lib/constants/brand";
import { FAQ_ITEMS } from "@/lib/constants/faqs";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about booking, deposits, braids, and visits at ${BRAND.fullName}.`,
};

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      <PageHero
        eyebrow="FAQs"
        title="Questions & Answers"
        description="Everything you need to know before your visit."
      />
      <Section background="white" className="!pt-0">
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
