import Link from "next/link";
import { Section } from "@/components/ui/section";

const TABS = [
  { href: "/book", label: "Book", icon: "📅" },
  { href: "/services", label: "Services", icon: "✂️" },
  { href: "/gallery", label: "Gallery", icon: "📷" },
  { href: "/about", label: "Shops", icon: "📍" },
  { href: "/experts", label: "Team", icon: "💇" },
  { href: "/contact", label: "Contact", icon: "💬" },
] as const;

export function HomeQuickNav() {
  return (
    <Section background="white" className="!py-10 sm:!py-12">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-glam-border bg-glam-background px-2 py-3 text-center transition hover:border-glam-accent hover:bg-glam-accent/5 sm:min-h-20"
          >
            <span className="text-2xl leading-none" aria-hidden>
              {tab.icon}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-glam-primary sm:text-sm">
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-glam-muted">
        <Link href="/track" className="font-medium text-glam-accent hover:underline">
          My booking
        </Link>
        {" · "}
        <Link href="/faq" className="font-medium text-glam-accent hover:underline">
          Help
        </Link>
      </p>
    </Section>
  );
}
