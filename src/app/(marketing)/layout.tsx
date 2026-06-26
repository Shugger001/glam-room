import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MarketingMain } from "@/components/layout/marketing-main";
import { MobileHomeBar, MobileHomeSpacer } from "@/components/layout/mobile-home-bar";
import { PremiumGrain } from "@/components/layout/premium-grain";
import { ScrollProgress } from "@/components/layout/scroll-progress";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PremiumGrain />
      <ScrollProgress />
      <SiteHeader />
      <MarketingMain>{children}</MarketingMain>
      <SiteFooter />
      <MobileHomeSpacer />
      <MobileHomeBar />
    </>
  );
}
