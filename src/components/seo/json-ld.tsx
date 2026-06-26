import { BRAND } from "@/lib/constants/brand";
import { FAQ_ITEMS } from "@/lib/constants/faqs";
import { MARKET } from "@/lib/constants/market";

export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: BRAND.fullName,
    description: `${BRAND.fullName} — luxury hair and beauty salon in ${MARKET.city}, ${MARKET.country}.`,
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://theglamroom.com",
    telephone: BRAND.links.phone,
    email: BRAND.links.email,
    image: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/og.png`,
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
    sameAs: [BRAND.links.instagram, BRAND.links.tiktok, BRAND.links.youtube],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
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
