import { LandingHero } from "@/components/landing/hero";
import { AboutPreview } from "@/components/landing/about-preview";
import { LocationsPreview } from "@/components/landing/locations-preview";
import { StatsRow } from "@/components/landing/stats-row";
import { ServicesPreview } from "@/components/services/service-card";
import { GalleryPreview } from "@/components/landing/gallery-preview";
import { TeamPreview } from "@/components/landing/team-preview";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { FindBookingTracker } from "@/components/booking/find-booking-tracker";
import { FaqPreview } from "@/components/landing/faq-section";
import { CtaBand } from "@/components/landing/cta-band";
import { FAQ_ITEMS } from "@/lib/constants/faqs";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { getSalonPageData } from "@/lib/data/salon-page-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const { services, gallery, staff, testimonials } = await getSalonPageData();

  return (
    <>
      <LocalBusinessJsonLd />
      <LandingHero />
      <StatsRow />
      <LocationsPreview />
      <AboutPreview />
      <ServicesPreview services={services} />
      <GalleryPreview items={gallery} />
      <TeamPreview staff={staff} />
      <TestimonialsSection testimonials={testimonials} />
      <FindBookingTracker />
      <FaqPreview items={FAQ_ITEMS} />
      <CtaBand />
    </>
  );
}
