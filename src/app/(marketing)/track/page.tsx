import type { Metadata } from "next";
import { FindBookingTracker } from "@/components/booking/find-booking-tracker";
import { PageHero } from "@/components/marketing/page-hero";
import { BRAND } from "@/lib/constants/brand";
import { getLiveSalonConfig } from "@/lib/data/live-site-content";

export const metadata: Metadata = {
  title: "Track Booking",
  description: `Check or update your ${BRAND.fullName} appointment.`,
};

export default async function TrackPage() {
  const salonConfig = await getLiveSalonConfig();

  return (
    <>
      <PageHero
        eyebrow="My booking"
        title="Find my booking"
        description="Enter phone and name to check, cancel, or change time."
      />
      <FindBookingTracker timeSlots={salonConfig.bookingTimeSlots} showHeader={false} />
    </>
  );
}
