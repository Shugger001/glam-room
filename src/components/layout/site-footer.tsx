import Link from "next/link";
import { GlamLogo } from "@/components/brand/glam-logo";
import { BRAND } from "@/lib/constants/brand";
import { FOOTER_NAV } from "@/lib/constants/navigation";
import { SALON_LOCATIONS } from "@/lib/constants/locations";

export function SiteFooter() {
  return (
    <footer className="border-t border-glam-border bg-glam-primary text-glam-secondary">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div className="space-y-4">
          <GlamLogo variant="onDark" asLink={false} />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            {BRAND.copy.heroTagline}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href={BRAND.links.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider text-glam-accent transition hover:text-white"
            >
              Instagram
            </a>
            <a
              href={BRAND.links.tiktok}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider text-glam-accent transition hover:text-white"
            >
              TikTok
            </a>
            <a
              href={BRAND.links.youtube}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider text-glam-accent transition hover:text-white"
            >
              YouTube
            </a>
            <a
              href={BRAND.links.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider text-glam-accent transition hover:text-white"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
            Salon
          </p>
          <ul className="space-y-2 text-sm text-white/70">
            {FOOTER_NAV.salon.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
            Visit
          </p>
          <ul className="space-y-2 text-sm text-white/70">
            {FOOTER_NAV.book.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
            Contact
          </p>
          <a
            href={BRAND.links.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="block text-sm text-white/70 transition hover:text-white"
          >
            WhatsApp: {BRAND.links.phone}
          </a>
          {SALON_LOCATIONS.map((loc) => (
            <div key={loc.id} className="mt-4">
              <p className="text-sm font-medium text-white/80">Glam Room · {loc.area}</p>
              <p className="text-sm text-white/50">{loc.address}</p>
              <a
                href={loc.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm text-glam-accent transition hover:text-white"
              >
                Get Directions
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.</p>
        <p className="mt-1">{BRAND.copy.footerTagline}</p>
      </div>
    </footer>
  );
}
