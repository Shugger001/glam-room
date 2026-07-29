import Link from "next/link";

const LINKS = [
  { href: "/book", label: "Book" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "Shops" },
  { href: "/testimonials", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;

export function HomeQuickNav() {
  return (
    <nav
      aria-label="Site sections"
      className="border-t border-glam-border/60 bg-glam-background px-4 py-10 sm:px-8 sm:py-12"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-center font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted">
          Explore
        </p>

        <div className="mt-6 flex flex-wrap items-baseline justify-center gap-x-6 gap-y-3 sm:gap-x-10">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="heading-display text-xl text-glam-primary transition duration-200 hover:text-glam-accent active:scale-[0.98] sm:text-2xl"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-5 text-sm text-glam-muted">
          <Link href="/track" className="transition hover:text-glam-accent">
            My booking
          </Link>
          <span className="h-3 w-px bg-glam-border" aria-hidden />
          <Link href="/faq" className="transition hover:text-glam-accent">
            Help
          </Link>
        </div>
      </div>
    </nav>
  );
}
