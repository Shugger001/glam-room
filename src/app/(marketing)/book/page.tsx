import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/booking-form";
import { BookPageShell } from "@/components/booking/book-page-shell";
import { isPaystackConfigured } from "@/lib/booking/deposit";
import { BRAND } from "@/lib/constants/brand";
import { getSalonServices } from "@/lib/data/live-services";
import { getLiveStaff } from "@/lib/data/live-staff";
import { getLiveLocations, getLiveSalonConfig } from "@/lib/data/live-site-content";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: `Book your luxury hair and beauty appointment at ${BRAND.fullName}. No account needed — we'll confirm via WhatsApp.`,
};

type BookPageProps = {
  searchParams: Promise<{ service?: string; location?: string; staff?: string }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;
  const [services, staff, locations, salonConfig] = await Promise.all([
    getSalonServices(),
    getLiveStaff(),
    getLiveLocations(),
    getLiveSalonConfig(),
  ]);
  const paystackEnabled = isPaystackConfigured();

  return (
    <BookPageShell>
      <BookingForm
        services={services}
        staff={staff}
        locations={locations}
        timeSlots={salonConfig.bookingTimeSlots}
        braidsNotice={salonConfig.braidsNotice}
        initialStaffId={params.staff}
        initialServiceId={params.service}
        initialLocationId={params.location}
        paystackEnabled={paystackEnabled}
      />
    </BookPageShell>
  );
}
