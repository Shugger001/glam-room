import Link from "next/link";

const LINKS = [
  { href: "/book", label: "Book" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "Shops" },
  { href: "/experts", label: "Team" },
  { href: "/contact", label: "Contact" },
] as const;

export function HomeQuickNav() {
  return (
    <nav
      aria-label="Site sections"
      className="border-t border-glam-accent/20 bg-glam-background px-4 py-8 sm:px-8 sm:py-10"
    >
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow-label text-center">Explore</p>
        <span className="gold-rule mx-auto" aria-hidden />

        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-[3.25rem] items-center justify-center rounded-lg border border-glam-border/70 bg-glam-secondary px-2 transition duration-300 hover:border-glam-accent/50 hover:shadow-soft sm:min-h-[4rem] sm:rounded-xl"
            >
              <span className="heading-display text-base tracking-wide text-glam-primary transition duration-300 group-hover:text-glam-accent sm:text-lg">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-center gap-5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-glam-muted">
          <Link href="/track" className="transition hover:text-glam-accent">
            My booking
          </Link>
          <span className="h-3 w-px bg-glam-accent/30" aria-hidden />
          <Link href="/faq" className="transition hover:text-glam-accent">
            Help
          </Link>
        </div>
      </div>
    </nav>
  );
}
