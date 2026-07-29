import { LandingHero } from "@/components/landing/hero";
import { HomeQuickNav } from "@/components/landing/home-quick-nav";
import { ServicesPreview } from "@/components/landing/services-preview";
import { GalleryPreview } from "@/components/landing/gallery-preview";
import { LocationsPreview } from "@/components/landing/locations-preview";
import { TeamPreview } from "@/components/landing/team-preview";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { CtaBand } from "@/components/landing/cta-band";
import { ButtonLink } from "@/components/ui/button";
import { FaqJsonLd, LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { getLiveFaqs, getLiveLocations } from "@/lib/data/live-site-content";
import { getLiveGallery } from "@/lib/data/live-gallery";
import { getStaffMembers } from "@/lib/data/live-staff";
import { getLiveTestimonials } from "@/lib/data/live-testimonials";

export const revalidate = 60;

export default async function HomePage() {
  const [faqs, gallery, locations, testimonials, staff] = await Promise.all([
    getLiveFaqs(),
    getLiveGallery(),
    getLiveLocations(),
    getLiveTestimonials(),
    getStaffMembers(),
  ]);

  return (
    <>
      <LocalBusinessJsonLd locations={locations} />
      <FaqJsonLd items={faqs} />
      <LandingHero />
      <HomeQuickNav />
      <ServicesPreview />
      <GalleryPreview
        items={gallery}
        limit={9}
        showFilters={false}
        viewAllHref="/gallery"
        balanced
      />
      <LocationsPreview locations={locations} />
      <TeamPreview staff={staff} />
      <TestimonialsSection testimonials={testimonials} />
      {testimonials.length > 0 ? (
        <div className="-mt-6 mb-4 flex justify-center pb-10 sm:pb-14">
          <ButtonLink href="/testimonials" variant="outline" size="lg" className="!rounded-none">
            Read all reviews
          </ButtonLink>
        </div>
      ) : null}
      <CtaBand />
    </>
  );
}
