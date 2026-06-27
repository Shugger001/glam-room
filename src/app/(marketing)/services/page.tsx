import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { ServicesGrid } from "@/components/services/service-card";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import { getSalonServices } from "@/lib/data/live-services";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Services",
  description: `Hair services at ${BRAND.fullName}. Adenta, Sowutuom, and Madina.`,
};

export default async function ServicesPage() {
  const services = await getSalonServices();

  return (
    <>
      <PageHero eyebrow="Services" title="Services" description="Pick a service and book." />
      <section className="container-narrow pb-16 sm:pb-24">
        <ServicesGrid services={services} />
      </section>
      <CtaBand />
    </>
  );
}
