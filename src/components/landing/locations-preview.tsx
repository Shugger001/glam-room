import Image from "next/image";
import Link from "next/link";
import { SalonOpenStatus } from "@/components/landing/salon-open-status";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { SALON_LOCATIONS } from "@/lib/constants/locations";

export function LocationsPreview() {
  return (
    <Section id="locations" background="accent">
      <SectionHeader
        eyebrow="Our Sanctuaries"
        title="Three Shops. One Standard."
        description="Adenta, Sowutuom, and our newest Madina location — same premium care, wherever you book."
        align="center"
      />
      <div className="mb-10 flex justify-center">
        <SalonOpenStatus variant="badge" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SALON_LOCATIONS.map((location, i) => (
          <Reveal key={location.id} delay={i * 0.1}>
            <article className="group overflow-hidden rounded-2xl bg-glam-secondary shadow-soft">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={location.image}
                  alt={`Glam Room ${location.area}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/70 to-transparent" />
                {location.badge ? (
                  <span className="absolute right-4 top-4 rounded-full bg-glam-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-glam-primary">
                    {location.badge}
                  </span>
                ) : null}
                <div className="absolute bottom-0 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-glam-accent">
                    Glam Room
                  </p>
                  <h3 className="heading-display mt-1 text-3xl text-glam-secondary">
                    {location.area}
                  </h3>
                  <p className="text-sm text-white/70">{location.address}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-6">
                <p className="text-sm text-glam-muted">{location.hours}</p>
                <div className="flex gap-3">
                  <Link
                    href={location.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-glam-accent hover:underline"
                  >
                    Directions
                  </Link>
                  <ButtonLink href={`/book?location=${location.id}`} size="sm" variant="accent">
                    Reserve
                  </ButtonLink>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
