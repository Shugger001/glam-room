import Link from "next/link";
import { GlamLogo } from "@/components/brand/glam-logo";
import { BRAND } from "@/lib/constants/brand";
import { FOOTER_NAV } from "@/lib/constants/navigation";
import { getDirectionsUrl } from "@/lib/maps/directions-url";
import { getLiveLocations } from "@/lib/data/live-site-content";

export async function SiteFooter() {
  const locations = await getLiveLocations();
  const compactNav = [...FOOTER_NAV.salon.slice(0, 4), ...FOOTER_NAV.book.slice(0, 3)];

  return (
    <footer className="relative border-t border-glam-border/40 bg-glam-background-warm text-glam-primary">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-16">
        <div className="space-y-4 lg:col-span-5">
          <GlamLogo variant="default" asLink={false} />
          <p className="max-w-xs text-sm leading-relaxed text-glam-muted">
            {BRAND.copy.heroTagline}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm text-glam-muted">
            <a
              href={BRAND.links.instagram}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-glam-accent"
            >
              Instagram
            </a>
            <a
              href={BRAND.links.tiktok}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-glam-accent"
            >
              TikTok
            </a>
            <a
              href={BRAND.links.youtube}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-glam-accent"
            >
              YouTube
            </a>
            <a
              href={BRAND.links.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-glam-accent"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted">
            Navigate
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-glam-primary/80">
            {compactNav.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link href={item.href} className="transition hover:text-glam-accent">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted">
            Visit
          </p>
          <a
            href={BRAND.links.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block text-sm text-glam-primary/80 transition hover:text-glam-accent"
          >
            WhatsApp {BRAND.links.phone}
          </a>
          <ul className="mt-5 space-y-4">
            {locations.map((loc) => (
              <li key={loc.id}>
                <p className="text-sm font-medium text-glam-primary">
                  Glam Room · {loc.area}
                </p>
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

      <div className="border-t border-glam-border/50 py-6 text-center text-xs text-glam-muted">
        <p>
          © {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
        </p>
        <p className="mt-1">{BRAND.copy.footerTagline}</p>
      </div>
    </footer>
  );
}
