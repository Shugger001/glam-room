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
import { ContactSection } from "@/components/landing/contact-section";
import { CtaBand } from "@/components/landing/cta-band";
import { FaqJsonLd, LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { getSalonPageData } from "@/lib/data/salon-page-data";

export const revalidate = 300;

export default async function HomePage() {
  const { services, gallery, staff, testimonials, faqs, locations, salonConfig } =
    await getSalonPageData();

  return (
    <>
      <LocalBusinessJsonLd />
      <FaqJsonLd items={faqs} />
      <LandingHero />
      <StatsRow
        locationCount={locations.length}
        serviceCount={services.length}
        testimonialCount={testimonials.length}
      />
      <LocationsPreview locations={locations} />
      <AboutPreview />
      <ServicesPreview services={services} />
      <GalleryPreview items={gallery} />
      <TeamPreview staff={staff} />
      <TestimonialsSection testimonials={testimonials} />
      <FindBookingTracker timeSlots={salonConfig.bookingTimeSlots} />
      <FaqPreview items={faqs} />
      <ContactSection locations={locations} />
      <CtaBand />
    </>
  );
}
