import { LandingHero } from "@/components/landing/hero";
import { HomeQuickNav } from "@/components/landing/home-quick-nav";
import { HomeLocationsStrip } from "@/components/landing/home-locations-strip";
import { FaqJsonLd, LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { getLiveFaqs, getLiveLocations } from "@/lib/data/live-site-content";

export const revalidate = 300;

export default async function HomePage() {
  const [faqs, locations] = await Promise.all([getLiveFaqs(), getLiveLocations()]);

  return (
    <>
      <LocalBusinessJsonLd />
      <FaqJsonLd items={faqs} />
      <LandingHero />
      <HomeQuickNav />
      <HomeLocationsStrip locations={locations} />
    </>
  );
}
