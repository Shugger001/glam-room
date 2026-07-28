import Link from "next/link";
import { Section, SectionHeader } from "@/components/ui/section";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import { ButtonLink } from "@/components/ui/button";
import { pickHomepageGalleryItems, type GalleryItem } from "@/lib/constants/gallery";

type GalleryPreviewProps = {
  items: GalleryItem[];
  limit?: number;
  showFilters?: boolean;
  viewAllHref?: string;
  balanced?: boolean;
};

export function GalleryPreview({
  items,
  limit,
  showFilters = true,
  viewAllHref,
  balanced = false,
}: GalleryPreviewProps) {
  const previewItems = limit
    ? balanced
      ? pickHomepageGalleryItems(items, limit)
      : items.slice(0, limit)
    : items;

  return (
    <Section id="gallery" narrow={false}>
      <div className="container-narrow">
        <SectionHeader
          eyebrow="Gallery"
          title="Recent work"
          description="Looks from our Accra shops."
          align="center"
        />
      </div>
      <div className="container-wide px-5 sm:px-8">
        <MasonryGallery items={previewItems} showFilters={showFilters} />
      </div>
      {viewAllHref ? (
        <div className="mt-10 flex justify-center">
          <ButtonLink href={viewAllHref} variant="outline" size="lg">
            View full gallery
          </ButtonLink>
        </div>
      ) : null}
      {!viewAllHref && limit && items.length > limit ? (
        <p className="mt-8 text-center text-sm text-glam-muted">
          <Link href="/gallery" className="font-medium text-glam-accent hover:underline">
            See all {items.length} looks
          </Link>
        </p>
      ) : null}
    </Section>
  );
}
