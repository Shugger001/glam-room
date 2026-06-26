import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/section";
import { TeamCard } from "@/components/landing/team-preview";
import { getStaffMembers } from "@/lib/data/live-staff";
import { BRAND } from "@/lib/constants/brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Experts",
  description: `Meet the expert stylists and beauty artists at ${BRAND.fullName}.`,
};

export default async function ExpertsPage() {
  const staff = await getStaffMembers();
  const lead = staff[0];

  return (
    <Section className="!pt-10">
      <SectionHeader
        eyebrow="The Queen Behind the Chair"
        title="Meet Asantewaa"
        description="Founder of Glam Room and The House of Asantewaa — expert hands, warm vibes, and zero tolerance for bad hair days."
        align="center"
      />
      {lead ? (
        <div className="mx-auto max-w-lg">
          <TeamCard member={lead} index={0} />
        </div>
      ) : null}
      <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-glam-muted">
        Every appointment at Glam Room is personally led by Asantewaa. From silk presses to braids
        and wig installs, you get the same premium care at our Adenta and Sowutuom studios.
      </p>
    </Section>
  );
}
