import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { FaqAccordion } from "@/components/landing/faq-section";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { FAQ_ITEMS } from "@/lib/constants/faqs";
import { BRAND } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about booking, services, and visiting ${BRAND.fullName}.`,
};

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      <Section className="!pt-10">
        <SectionHeader
          eyebrow="FAQs"
          title="Common Questions"
          description="Everything you need to know before your visit."
          align="center"
        />
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </Section>
    </>
  );
}
