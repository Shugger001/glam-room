import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";
import { getLiveServices } from "@/lib/data/live-services";
import { getLiveStaff } from "@/lib/data/live-staff";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: `Book your luxury hair and beauty appointment at ${BRAND.fullName}.`,
};

type BookPageProps = {
  searchParams: Promise<{ service?: string }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;
  const [services, staff] = await Promise.all([getLiveServices(), getLiveStaff()]);

  return (
    <div className="section-padding !pt-28">
      <div className="container-narrow">
        <Reveal>
          <SectionHeader
            eyebrow="Booking"
            title="Reserve Your Experience"
            description="Select your service, choose your stylist, and secure your appointment with a deposit."
            align="center"
          />
        </Reveal>
        <BookingWizard
          services={services}
          staff={staff}
          initialServiceId={params.service}
        />
      </div>
    </div>
  );
}
