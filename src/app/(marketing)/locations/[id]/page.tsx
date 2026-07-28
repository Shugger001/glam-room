import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/landing/cta-band";
import { PageHero } from "@/components/marketing/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { getDirectionsUrl } from "@/lib/maps/directions-url";

type LocationPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return SALON_LOCATIONS.map((loc) => ({ id: loc.id }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { id } = await params;
  const loc = SALON_LOCATIONS.find((l) => l.id === id);
  if (!loc) return { title: "Shop" };
  return {
    title: `${loc.area} shop`,
    description: `${BRAND.fullName} in ${loc.area}, Accra — ${loc.address}. Book hair, installs, and braids. Open Mon–Sun 8am–8pm.`,
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { id } = await params;
  const loc = SALON_LOCATIONS.find((l) => l.id === id);
  if (!loc) notFound();

  const directions = getDirectionsUrl(loc);
  const gbp = process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL?.trim();

  return (
    <>
      <PageHero
        eyebrow={loc.badge ?? "Shop"}
        title={`Glam Room · ${loc.area}`}
        description={loc.address}
      />
      <Section background="white">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-glam-border shadow-soft sm:aspect-[5/4]">
            <Image
              src={loc.image}
              alt={`${BRAND.name} ${loc.area} salon`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div>
            <p className="eyebrow-label">Visit</p>
            <span className="gold-rule" aria-hidden />
            <h2 className="heading-display mt-4 text-3xl sm:text-4xl">{loc.area}</h2>
            <p className="mt-4 text-glam-muted">{loc.address}</p>
            <p className="mt-2 text-sm text-glam-muted">{loc.hours}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/book?location=${loc.id}`} variant="accent">
                Book this shop
              </ButtonLink>
              <ButtonLink href={directions} variant="outline" target="_blank" rel="noreferrer">
                Get directions
              </ButtonLink>
              {gbp ? (
                <ButtonLink href={gbp} variant="ghost" target="_blank" rel="noreferrer">
                  Google reviews
                </ButtonLink>
              ) : null}
            </div>
            <p className="mt-8 text-sm text-glam-muted">
              Looking for another shop?{" "}
              <Link href="/about" className="font-medium text-glam-accent hover:underline">
                See all Accra locations
              </Link>
            </p>
          </div>
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
