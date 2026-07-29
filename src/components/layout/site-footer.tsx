import Link from "next/link";
import { GlamLogo } from "@/components/brand/glam-logo";
import { SocialLinks } from "@/components/brand/social-links";
import { BRAND } from "@/lib/constants/brand";
import { FOOTER_NAV } from "@/lib/constants/navigation";
import { getDirectionsUrl } from "@/lib/maps/directions-url";
import { getLiveLocations } from "@/lib/data/live-site-content";

export async function SiteFooter() {
  const locations = await getLiveLocations();

  return (
    <footer className="relative border-t border-glam-border/40 bg-glam-background-warm text-glam-primary">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        {/* Brand + social */}
        <div className="flex flex-col gap-6 border-b border-glam-border/50 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm space-y-3">
            <GlamLogo variant="default" asLink />
            <p className="heading-display text-2xl text-glam-primary sm:text-3xl">
              {BRAND.tagline}
            </p>
            <p className="text-sm leading-relaxed text-glam-muted">
              {BRAND.copy.heroTagline}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted">
              Follow
            </p>
            <SocialLinks className="mt-2 sm:justify-end" />
          </div>
        </div>

        {/* Link columns */}
        <div className="grid gap-10 pt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div>
            <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-glam-primary/80">
              {FOOTER_NAV.salon.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-glam-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted">
              Book
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-glam-primary/80">
              {FOOTER_NAV.book.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-glam-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={BRAND.links.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block text-sm font-medium text-glam-accent transition hover:text-glam-accent-deep"
            >
              WhatsApp {BRAND.links.phone}
            </a>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted">
              Shops
            </p>
            <ul className="mt-4 space-y-4">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <p className="text-sm font-medium text-glam-primary">{loc.area}</p>
                  <p className="text-sm text-glam-muted">{loc.address}</p>
                  <a
                    href={getDirectionsUrl(loc)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-glam-accent transition hover:text-glam-accent-deep"
                  >
                    Directions
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-glam-border/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-glam-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {BRAND.fullName}
          </p>
          <p>{BRAND.copy.footerTagline}</p>
        </div>
      </div>
    </footer>
  );
}
