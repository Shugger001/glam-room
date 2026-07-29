import Link from "next/link";
import { SalonOpenStatus } from "@/components/landing/salon-open-status";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { SALON_LOCATIONS, type SalonLocation } from "@/lib/constants/locations";
import { cn } from "@/lib/utils/cn";

function ShopMedia({
  location,
  featured,
}: {
  location: SalonLocation;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/locations/${location.id}`}
      className={cn(
        "relative block overflow-hidden",
        featured ? "aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto lg:min-h-[28rem]" : "aspect-[16/10]",
      )}
    >
      <ParallaxImage
        src={location.image}
        alt={`Glam Room ${location.area}`}
        sizes={
          featured
            ? "(max-width: 1024px) 100vw, 58vw"
            : "(max-width: 1024px) 100vw, 40vw"
        }
        className="absolute inset-0"
        imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        yRange={["-4%", "4%"]}
        scaleRange={[1.05, 1.08]}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/75 via-glam-primary/15 to-transparent" />
      {location.badge ? (
        <span className="absolute right-4 top-4 bg-glam-accent px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-glam-primary">
          {location.badge}
        </span>
      ) : null}
      <div className={cn("absolute bottom-0 p-5 sm:p-6", featured && "sm:p-8")}>
        <p className="font-[family-name:var(--font-cormorant)] text-sm italic text-glam-accent-light">
          Glam Room
        </p>
        <h3
          className={cn(
            "heading-display mt-1 text-glam-secondary",
            featured ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl",
          )}
        >
          {location.area}
        </h3>
        <p className="mt-1 text-sm text-white/70">{location.address}</p>
      </div>
    </Link>
  );
}

function ShopActions({ location }: { location: SalonLocation }) {
  return (
    <div className="flex flex-col gap-3 border-t border-glam-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-glam-muted">{location.hours}</p>
      <div className="flex gap-3">
        <Link
          href={`/locations/${location.id}`}
          className="inline-flex min-h-11 flex-1 items-center justify-center border border-glam-border px-4 text-sm font-medium text-glam-primary transition duration-200 hover:border-glam-accent hover:text-glam-accent active:scale-[0.98] sm:flex-none"
        >
          Shop details
        </Link>
        <ButtonLink
          href={`/book?location=${location.id}`}
          size="sm"
          variant="accent"
          className="min-h-11 flex-1 justify-center !rounded-none sm:flex-none"
        >
          Reserve
        </ButtonLink>
      </div>
    </div>
  );
}

export function LocationsPreview({ locations = SALON_LOCATIONS }: { locations?: SalonLocation[] }) {
  const [featured, ...rest] = locations;
  if (!featured) return null;

  return (
    <Section id="locations" background="warm">
      <SectionHeader
        eyebrow="Our shops"
        title="Three shops. One standard."
        description="Book Adenta, Sowutuom, or Madina — same care at every chair."
        align="left"
      />
      <div className="mb-8">
        <SalonOpenStatus variant="badge" />
      </div>

      {/* Mobile: horizontal scroll strip */}
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory lg:hidden">
        {locations.map((location, i) => (
          <Reveal key={location.id} delay={i * 0.08} className="w-[85vw] max-w-sm shrink-0 snap-center">
            <article className="group overflow-hidden bg-glam-secondary/40">
              <ShopMedia location={location} />
              <ShopActions location={location} />
            </article>
          </Reveal>
        ))}
      </div>

      {/* Desktop: asymmetric featured + stack */}
      <div className="hidden gap-5 lg:grid lg:grid-cols-12">
        <Reveal className="col-span-7">
          <article className="group h-full overflow-hidden bg-glam-secondary/40">
            <ShopMedia location={featured} featured />
            <ShopActions location={featured} />
          </article>
        </Reveal>
        <div className="col-span-5 flex flex-col gap-5">
          {rest.map((location, i) => (
            <Reveal key={location.id} delay={0.1 + i * 0.08}>
              <article className="group overflow-hidden bg-glam-secondary/40">
                <ShopMedia location={location} />
                <ShopActions location={location} />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
