import { Section, SectionHeader } from "@/components/ui/section";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import type { GalleryItem } from "@/lib/constants/gallery";

export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  return (
    <Section id="gallery" narrow={false}>
      <div className="container-narrow">
        <SectionHeader
          eyebrow="Gallery"
          title="Gallery"
          description="Recent work."
          align="center"
        />
      </div>
      <div className="container-wide px-5 sm:px-8">
        <MasonryGallery items={items} showFilters />
      </div>
    </Section>
  );
}
