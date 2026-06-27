import type { Metadata } from "next";
import { TeamCard } from "@/components/landing/team-preview";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/components/landing/cta-band";
import { BRAND } from "@/lib/constants/brand";
import { getStaffMembers } from "@/lib/data/live-staff";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Team",
  description: `Stylists at ${BRAND.fullName}, Accra.`,
};

export default async function ExpertsPage() {
  const staff = await getStaffMembers();

  return (
    <>
      <PageHero eyebrow="Team" title="Our stylists" description="Meet the team." />
      <Section background="white" className="!pt-0">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          {staff.map((member, i) => (
            <TeamCard key={member.id} member={member} index={i} />
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
