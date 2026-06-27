import Link from "next/link";
import { SalonOpenStatus } from "@/components/landing/salon-open-status";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { SALON_LOCATIONS, type SalonLocation } from "@/lib/constants/locations";
import { getDirectionsUrl } from "@/lib/maps/directions-url";

export function LocationsPreview({ locations = SALON_LOCATIONS }: { locations?: SalonLocation[] }) {
  return (
    <Section id="locations" background="accent">
      <SectionHeader
        eyebrow="Our Sanctuaries"
        title="Three Shops. One Standard."
        description="Three shops across Accra."
        align="center"
      />
      <div className="mb-10 flex justify-center">
        <SalonOpenStatus variant="badge" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location, i) => (
          <Reveal key={location.id} delay={i * 0.1}>
            <article className="premium-card group overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <ParallaxImage
                  src={location.image}
                  alt={`Glam Room ${location.area}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="absolute inset-0"
                  imageClassName="transition-transform duration-700 group-hover:scale-105"
                  yRange={["-5%", "5%"]}
                  scaleRange={[1.06, 1.1]}
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
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <p className="text-sm text-glam-muted">{location.hours}</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href={getDirectionsUrl(location)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-glam-border px-4 text-sm font-medium text-glam-primary transition hover:border-glam-accent hover:text-glam-accent"
                  >
                    Directions
                  </Link>
                  <ButtonLink
                    href={`/book?location=${location.id}`}
                    size="sm"
                    variant="accent"
                    className="min-h-11 flex-1 justify-center"
                  >
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
