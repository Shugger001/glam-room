import type { Metadata } from "next";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { PageHero } from "@/components/marketing/page-hero";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import { getLiveTestimonials } from "@/lib/data/live-testimonials";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Testimonials",
  description: `Reviews and love notes from ${BRAND.fullName} clients across Accra.`,
};

export default async function TestimonialsPage() {
  const testimonials = await getLiveTestimonials();

  return (
    <>
      <PageHero
        eyebrow="Love Notes"
        title="What the Girls Are Saying"
        description="Real words from queens who've sat in our chair."
      />
      <TestimonialsSection testimonials={testimonials} />
      <CtaBand />
    </>
  );
}
