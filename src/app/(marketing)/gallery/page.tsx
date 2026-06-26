import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import { getLiveGallery } from "@/lib/data/live-gallery";
import { BRAND } from "@/lib/constants/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: `View our portfolio of luxury hair and beauty transformations at ${BRAND.fullName}.`,
};

export default async function GalleryPage() {
  const items = await getLiveGallery();

  return (
    <Section className="!pt-10" narrow={false}>
      <div className="container-narrow px-5 sm:px-8">
        <SectionHeader
          eyebrow="Gallery"
          title="Portfolio"
          description="A peek at the slay. Real client photos from Glam Room by Asantewaa."
          align="center"
        />
      </div>
      <div className="container-wide px-5 sm:px-8">
        <MasonryGallery items={items} />
      </div>
    </Section>
  );
}
