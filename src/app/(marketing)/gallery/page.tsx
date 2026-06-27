import type { Metadata } from "next";
import { GalleryPreview } from "@/components/landing/gallery-preview";
import { PageHero } from "@/components/marketing/page-hero";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import { getLiveGallery } from "@/lib/data/live-gallery";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gallery",
  description: `Real client transformations from ${BRAND.fullName}. Braids, silk presses, and installs across Accra.`,
};

export default async function GalleryPage() {
  const gallery = await getLiveGallery();

  return (
    <>
      <PageHero eyebrow="Gallery" title="Gallery" description="Recent work from our shops." />
      <GalleryPreview items={gallery} />
      <CtaBand />
    </>
  );
}
