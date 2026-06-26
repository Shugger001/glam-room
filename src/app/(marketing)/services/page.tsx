import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { ServicesGrid } from "@/components/services/service-card";
import { getSalonServices } from "@/lib/data/live-services";
import { BRAND } from "@/lib/constants/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description: `Explore hair services at ${BRAND.fullName} — hair reset, installs, and braids in Adenta and Sowutuom.`,
};

export default async function ServicesPage() {
  const services = await getSalonServices();

  return (
    <Section className="!pt-10">
      <SectionHeader
        eyebrow="Services"
        title="Services That Slay"
        description="Pick your vibe and let us work our magic. Every service comes with main character energy included."
        align="center"
      />
      <ServicesGrid services={services} />
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-glam-muted" role="note">
        {BRAND.copy.braidsNotice}
      </p>
    </Section>
  );
}
