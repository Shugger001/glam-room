import Link from "next/link";
import { Section } from "@/components/ui/section";
import type { SalonLocation } from "@/lib/constants/locations";
import { SALON_LOCATIONS } from "@/lib/constants/locations";

export function HomeLocationsStrip({
  locations = SALON_LOCATIONS,
}: {
  locations?: SalonLocation[];
}) {
  return (
    <Section background="accent" className="!py-10 sm:!py-12">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
        Our shops
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {locations.map((loc) => (
          <Link
            key={loc.id}
            href={`/book?location=${loc.id}`}
            className="rounded-2xl border border-glam-border/80 bg-glam-secondary/90 px-4 py-5 text-center shadow-soft transition hover:border-glam-accent"
          >
            <p className="heading-display text-xl text-glam-primary">{loc.area}</p>
            {loc.badge ? (
              <span className="mt-1 inline-block text-[0.65rem] font-semibold uppercase text-glam-accent">
                {loc.badge}
              </span>
            ) : null}
            <p className="mt-2 text-xs text-glam-muted">{loc.hours}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
