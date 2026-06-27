import { SiteHeader } from "@/components/layout/site-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { SiteFooter } from "@/components/layout/site-footer";
import { MarketingMain } from "@/components/layout/marketing-main";
import { MobileHomeBar, MobileHomeSpacer } from "@/components/layout/mobile-home-bar";
import { PremiumGrain } from "@/components/layout/premium-grain";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { LuxuryCursor } from "@/components/motion/luxury-cursor";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PremiumGrain />
      <LuxuryCursor />
      <ScrollProgress />
      <SiteHeader />
      <MarketingMain>{children}</MarketingMain>
      <MarketingFooter fullFooter={<SiteFooter />} />
      <MobileHomeSpacer />
      <MobileHomeBar />
    </>
  );
}
