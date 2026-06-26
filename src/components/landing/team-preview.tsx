import Link from "next/link";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import type { StaffMember } from "@/lib/constants/staff";

export function TeamCard({ member, index = 0 }: { member: StaffMember; index?: number }) {
  return (
    <Reveal delay={index * 0.1}>
      <article className="premium-card group overflow-hidden">
        <div className="relative aspect-[3/4] overflow-hidden">
          <ParallaxImage
            src={member.image}
            alt={member.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="absolute inset-0"
            imageClassName="transition-transform duration-700 group-hover:scale-105"
            yRange={["-6%", "6%"]}
            scaleRange={[1.06, 1.12]}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
              {member.experience}
            </p>
            <h3 className="heading-display mt-1 text-2xl text-glam-secondary">{member.name}</h3>
            <p className="text-sm text-white/70">{member.role}</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-glam-muted">{member.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {member.specialty.map((s) => (
              <span
                key={s}
                className="rounded-full bg-glam-accent/15 px-3 py-1 text-xs font-medium text-glam-primary"
              >
                {s}
              </span>
            ))}
          </div>
          {member.instagram ? (
            <Link
              href={member.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-glam-accent transition hover:text-glam-primary"
            >
              Instagram →
            </Link>
          ) : null}
        </div>
      </article>
    </Reveal>
  );
}

export function TeamPreview({ staff }: { staff: StaffMember[] }) {
  return (
    <Section id="experts" background="white">
      <SectionHeader
        eyebrow="The Queen Behind the Chair"
        title="Meet Asantewaa"
        description="Glam Room is her love letter to Accra — warm vibes, expert hands, and zero tolerance for bad hair days."
        align="center"
      />
      <div className="mx-auto grid max-w-md gap-6">
        {staff.slice(0, 1).map((member, i) => (
          <TeamCard key={member.id} member={member} index={i} />
        ))}
      </div>
      <Reveal className="mt-12 text-center">
        <ButtonLink href="/#experts" variant="outline" size="lg">
          Learn More
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
