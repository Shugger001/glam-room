import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { ServicesByCategory } from "@/components/services/services-by-category";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import { getSalonServices } from "@/lib/data/live-services";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Services",
  description: `Hair installation, braiding, and hair reset services at ${BRAND.fullName}. Adenta, Sowutuom, and Madina.`,
};

export default async function ServicesPage() {
  const services = await getSalonServices();

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="What we offer"
        description="Three categories — pick a style and book your chair."
      />
      <section className="container-narrow pb-16 sm:pb-24">
        <ServicesByCategory services={services} layout="list" />
      </section>
      <CtaBand />
    </>
  );
}
