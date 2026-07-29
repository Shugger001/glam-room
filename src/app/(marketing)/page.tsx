import { LandingHero } from "@/components/landing/hero";
import { HomeQuickNav } from "@/components/landing/home-quick-nav";
import { GalleryPreview } from "@/components/landing/gallery-preview";
import { LocationsPreview } from "@/components/landing/locations-preview";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { CtaBand } from "@/components/landing/cta-band";
import { FaqJsonLd, LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { getLiveFaqs, getLiveLocations } from "@/lib/data/live-site-content";
import { getLiveGallery } from "@/lib/data/live-gallery";
import { getLiveTestimonials } from "@/lib/data/live-testimonials";

export const revalidate = 60;

export default async function HomePage() {
  const [faqs, gallery, locations, testimonials] = await Promise.all([
    getLiveFaqs(),
    getLiveGallery(),
    getLiveLocations(),
    getLiveTestimonials(),
  ]);

  return (
    <>
      <LocalBusinessJsonLd locations={locations} />
      <FaqJsonLd items={faqs} />
      <LandingHero />
      <HomeQuickNav />
      <GalleryPreview
        items={gallery}
        limit={9}
        showFilters={false}
        viewAllHref="/gallery"
        balanced
      />
      <LocationsPreview locations={locations} />
      <TestimonialsSection testimonials={testimonials} />
      <CtaBand />
    </>
  );
}
