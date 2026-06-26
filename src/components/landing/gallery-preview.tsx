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
          eyebrow="Portfolio"
          title="The Glam Gallery"
          description="Real client transformations from Adenta and Sowutuom — silk presses, braids, installs, and glow-ups."
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
