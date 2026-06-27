import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/booking-form";
import { BookPageShell } from "@/components/booking/book-page-shell";
import { isPaystackConfigured } from "@/lib/booking/deposit";
import { BRAND } from "@/lib/constants/brand";
import { getSalonServices } from "@/lib/data/live-services";
import { getLiveStaff } from "@/lib/data/live-staff";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: `Book your luxury hair and beauty appointment at ${BRAND.fullName}. No account needed — we'll confirm via WhatsApp.`,
};

type BookPageProps = {
  searchParams: Promise<{ service?: string; location?: string; staff?: string }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;
  const [services, staff] = await Promise.all([getSalonServices(), getLiveStaff()]);
  const paystackEnabled = isPaystackConfigured();

  return (
    <BookPageShell>
      <BookingForm
        services={services}
        staff={staff}
        initialStaffId={params.staff}
        initialServiceId={params.service}
        initialLocationId={params.location}
        paystackEnabled={paystackEnabled}
      />
    </BookPageShell>
  );
}
