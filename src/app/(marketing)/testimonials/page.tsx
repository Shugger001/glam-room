import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { getLiveTestimonials } from "@/lib/data/live-testimonials";
import { BRAND } from "@/lib/constants/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testimonials",
  description: `Read what clients say about their experience at ${BRAND.fullName}.`,
};

export default async function TestimonialsPage() {
  const testimonials = await getLiveTestimonials();

  return (
    <>
      <Section className="!pt-10 !pb-8">
        <SectionHeader
          eyebrow="Testimonials"
          title="Client Love"
          description="Real stories from real clients who trust The Glam Room with their beauty."
          align="center"
        />
      </Section>
      <TestimonialsSection testimonials={testimonials} />
    </>
  );
}
