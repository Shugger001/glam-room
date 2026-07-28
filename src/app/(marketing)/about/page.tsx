import type { Metadata } from "next";
import { AboutPreview } from "@/components/landing/about-preview";
import { LocationsPreview } from "@/components/landing/locations-preview";
import { PageHero } from "@/components/marketing/page-hero";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import { getLiveLocations } from "@/lib/data/live-site-content";

export const metadata: Metadata = {
  title: "Shops in Adenta, Sowutuom & Madina",
  description:
    "Visit Glam Room by Asantewaa in Adenta, Sowutuom, and Madina, Accra. Book hair installs, braids, and glam makeup at three Accra shops.",
};

export default async function AboutPage() {
  const locations = await getLiveLocations();

  return (
    <>
      <PageHero
        eyebrow="Shops"
        title="Glam Room"
        description={BRAND.copy.aboutIntro[0]}
      />
      <AboutPreview />
      <LocationsPreview locations={locations} />
      <CtaBand />
    </>
  );
}
