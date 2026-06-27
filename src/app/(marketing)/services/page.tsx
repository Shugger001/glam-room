import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { ServicesGrid } from "@/components/services/service-card";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import { getSalonServices } from "@/lib/data/live-services";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Services",
  description: `Hair resets, installations, and braids at ${BRAND.fullName} — Adenta, Sowutuom, and Madina, Accra.`,
};

export default async function ServicesPage() {
  const services = await getSalonServices();

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Your Crown, Our Craft"
        description="From silk presses to waist-length braids — transparent pricing and expert hands at every Glam Room location."
      />
      <section className="container-narrow pb-16 sm:pb-24">
        <ServicesGrid services={services} />
      </section>
      <CtaBand />
    </>
  );
}
