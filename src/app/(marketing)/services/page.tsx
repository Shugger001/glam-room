import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { ServicesGrid } from "@/components/services/service-card";
import { getSalonServices } from "@/lib/data/live-services";
import { BRAND } from "@/lib/constants/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description: `Explore luxury hair and beauty services at ${BRAND.fullName} — styling, wigs, braids, makeup, lashes, and bridal.`,
};

export default async function ServicesPage() {
  const services = await getSalonServices();

  return (
    <Section className="!pt-10">
      <SectionHeader
        eyebrow="Services"
        title="Our Menu"
        description="Every service is delivered with premium products, expert technique, and the personalised attention you deserve."
        align="center"
      />
      <ServicesGrid services={services} />
    </Section>
  );
}
