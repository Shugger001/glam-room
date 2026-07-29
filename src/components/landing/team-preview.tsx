import Link from "next/link";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import type { StaffMember } from "@/lib/constants/staff";

export function TeamCard({ member, index = 0 }: { member: StaffMember; index?: number }) {
  return (
    <Reveal delay={index * 0.08}>
      <article className="group">
        <div className="relative aspect-[3/4] overflow-hidden">
          <ParallaxImage
            src={member.image}
            alt={member.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="absolute inset-0"
            imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            yRange={["-5%", "5%"]}
            scaleRange={[1.05, 1.1]}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/75 via-transparent to-transparent" />
          <div className="absolute bottom-0 p-5 sm:p-6">
            <p className="font-[family-name:var(--font-cormorant)] text-sm italic text-glam-accent">
              {member.experience}
            </p>
            <h3 className="heading-display mt-1 text-2xl text-glam-secondary">{member.name}</h3>
            <p className="text-sm text-white/70">{member.role}</p>
          </div>
        </div>
        <div className="pt-5">
          <p className="text-sm leading-relaxed text-glam-muted">{member.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {member.specialty.map((s) => (
              <span key={s} className="text-xs text-glam-muted">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <ButtonLink
              href={`/book?staff=${member.id}`}
              size="sm"
              variant="accent"
              className="!rounded-none"
            >
              Book with {member.name.split(" ")[0]}
            </ButtonLink>
            {member.instagram ? (
              <Link
                href={member.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-glam-accent transition hover:text-glam-primary"
              >
                Instagram
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function TeamPreview({ staff }: { staff: StaffMember[] }) {
  return (
    <Section id="experts" background="default">
      <SectionHeader
        eyebrow="Team"
        title="Our stylists"
        description="Meet the people behind the chair."
        align="left"
      />
      <div className="mx-auto grid max-w-md gap-8">
        {staff.slice(0, 1).map((member, i) => (
          <TeamCard key={member.id} member={member} index={i} />
        ))}
      </div>
      <Reveal className="mt-10">
        <ButtonLink href="/experts" variant="outline" size="lg" className="!rounded-none">
          See team
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
