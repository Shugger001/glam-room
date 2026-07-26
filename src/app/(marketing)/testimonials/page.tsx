import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import { getLiveTestimonials } from "@/lib/data/live-testimonials";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Reviews",
  description: `Client love notes from ${BRAND.fullName}. Real reviews from Adenta, Sowutuom, and Madina.`,
};

export default async function TestimonialsPage() {
  const testimonials = await getLiveTestimonials();

  return (
    <>
      <PageHero
        eyebrow="Love Notes"
        title="Client reviews"
        description="What Accra says after sitting in our chair."
      />
      <TestimonialsSection testimonials={testimonials} />
      <CtaBand />
    </>
  );
}
