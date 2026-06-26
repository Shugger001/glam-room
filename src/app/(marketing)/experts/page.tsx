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

  return (
    <Section className="!pt-10">
      <SectionHeader
        eyebrow="Our Experts"
        title="The Team"
        description="Passionate professionals dedicated to making you look and feel extraordinary."
        align="center"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {staff.map((member, i) => (
          <TeamCard key={member.id} member={member} index={i} />
        ))}
      </div>
    </Section>
  );
}
