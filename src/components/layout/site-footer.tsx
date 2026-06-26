import Link from "next/link";
import { GlamLogo } from "@/components/brand/glam-logo";
import { BRAND } from "@/lib/constants/brand";
import { FOOTER_NAV } from "@/lib/constants/navigation";

const googleMapsUrl =
  process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL?.trim() ||
  `https://maps.google.com/?q=${encodeURIComponent(`${BRAND.address.street}, ${BRAND.address.city}, ${BRAND.address.country}`)}`;

export function SiteFooter() {
  return (
    <footer className="border-t border-glam-border bg-glam-primary text-glam-secondary">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div className="space-y-4">
          <GlamLogo variant="onDark" asLink={false} />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            Accra&apos;s premier luxury hair and beauty destination. Where artistry meets
            elegance, and every visit leaves you feeling extraordinary.
          </p>
          <div className="flex gap-4 pt-2">
            <a
              href={BRAND.links.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider text-glam-accent transition hover:text-white"
              aria-label="Instagram"
            >
              Instagram
            </a>
            <a
              href={BRAND.links.facebook}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider text-glam-accent transition hover:text-white"
              aria-label="Facebook"
            >
              Facebook
            </a>
            <a
              href={BRAND.links.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider text-glam-accent transition hover:text-white"
              aria-label="WhatsApp"
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
            <li>
              <Link href="/admin" className="transition hover:text-white">
                Staff Login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
            Contact
          </p>
          <a
            href={`mailto:${BRAND.links.email}`}
            className="block text-sm text-white/70 transition hover:text-white"
          >
            {BRAND.links.email}
          </a>
          <a
            href={`tel:${BRAND.links.phone.replace(/\s/g, "")}`}
            className="mt-2 block text-sm text-white/70 transition hover:text-white"
          >
            {BRAND.links.phone}
          </a>
          <p className="mt-3 text-sm text-white/50">
            {BRAND.address.street}
            <br />
            {BRAND.address.city}, {BRAND.address.country}
          </p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-glam-accent transition hover:text-white"
          >
            Get Directions
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {BRAND.fullName}. All rights reserved.
      </div>
    </footer>
  );
}
