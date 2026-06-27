import { LandingHero } from "@/components/landing/hero";
import { HomeQuickNav } from "@/components/landing/home-quick-nav";
import { FaqJsonLd, LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { getLiveFaqs } from "@/lib/data/live-site-content";

export const revalidate = 300;

export default async function HomePage() {
  const faqs = await getLiveFaqs();

  return (
    <>
      <LocalBusinessJsonLd />
      <FaqJsonLd items={faqs} />
      <LandingHero />
      <HomeQuickNav />
    </>
  );
}
