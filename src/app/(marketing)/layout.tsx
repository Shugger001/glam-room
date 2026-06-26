import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FloatingBookCta } from "@/components/layout/floating-book-cta";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col pt-[var(--header-height)]">{children}</main>
      <SiteFooter />
      <FloatingBookCta />
    </>
  );
}
