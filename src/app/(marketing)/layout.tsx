import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MarketingMain } from "@/components/layout/marketing-main";
import { FloatingBookCta } from "@/components/layout/floating-book-cta";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <MarketingMain>{children}</MarketingMain>
      <SiteFooter />
      <FloatingBookCta />
    </>
  );
}
