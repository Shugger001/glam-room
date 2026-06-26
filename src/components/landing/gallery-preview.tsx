import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import type { GalleryItem } from "@/lib/constants/gallery";

export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  return (
    <Section id="gallery" narrow={false}>
      <div className="container-narrow">
        <SectionHeader
          eyebrow="Gallery"
          title="Our Work Speaks"
          description="Browse our portfolio of transformations — each one a testament to the artistry and care we bring to every client."
          align="center"
        />
      </div>
      <div className="container-wide px-5 sm:px-8">
        <MasonryGallery items={items.slice(0, 6)} showFilters={false} />
      </div>
      <Reveal className="container-narrow mt-12 text-center">
        <ButtonLink href="/gallery" variant="outline" size="lg">
          View Full Gallery
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
