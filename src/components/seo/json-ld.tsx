import { BRAND } from "@/lib/constants/brand";
import type { FaqItem } from "@/lib/constants/faqs";
import { SALON_LOCATIONS, type SalonLocation } from "@/lib/constants/locations";
import { MARKET } from "@/lib/constants/market";

function googleBusinessUrl() {
  return process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL?.trim() || null;
}

function sameAsLinks(): string[] {
  const links: string[] = [BRAND.links.instagram, BRAND.links.tiktok, BRAND.links.youtube];
  const gbp = googleBusinessUrl();
  if (gbp) links.push(gbp);
  return links;
}

function departmentSchema(loc: SalonLocation) {
  return {
    "@type": "BeautySalon",
    "@id": `${process.env.NEXT_PUBLIC_APP_URL ?? "https://theglamroom.com"}/locations/${loc.id}`,
    name: `${BRAND.name} · ${loc.area}`,
    description: `${BRAND.fullName} in ${loc.area}, ${loc.city}.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://theglamroom.com"}/locations/${loc.id}`,
    telephone: BRAND.links.phone,
    email: BRAND.links.email,
    image: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${loc.image}`,
    priceRange: "₵₵₵",
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.address,
      addressLocality: loc.city,
      addressRegion: BRAND.address.region,
      addressCountry: loc.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: loc.lat,
      longitude: loc.lng,
    },
    hasMap: loc.mapUrl,
    openingHoursSpecification: BRAND.hours
      .filter((h) => !h.closed)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
  };
}

export function LocalBusinessJsonLd({ locations = SALON_LOCATIONS }: { locations?: SalonLocation[] }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://theglamroom.com";
  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${baseUrl}/#salon`,
    name: BRAND.fullName,
    description: `${BRAND.fullName}. Luxury hair and beauty salon in ${MARKET.city}, ${MARKET.country}.`,
    url: baseUrl,
    telephone: BRAND.links.phone,
    email: BRAND.links.email,
    image: `${baseUrl}/og.png`,
    priceRange: "₵₵₵",
    address: {
      "@type": "PostalAddress",
      streetAddress: BRAND.address.street,
      addressLocality: BRAND.address.city,
      addressRegion: BRAND.address.region,
      addressCountry: BRAND.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BRAND.address.lat,
      longitude: BRAND.address.lng,
    },
    openingHoursSpecification: BRAND.hours
      .filter((h) => !h.closed)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
    sameAs: sameAsLinks(),
    department: locations.map(departmentSchema),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
