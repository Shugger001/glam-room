"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "Shops" },
  { href: "/book", label: "Book", primary: true },
  { href: BRAND.links.whatsapp, label: "Chat", external: true },
] as const;

function showMobileTabBar(pathname: string) {
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return false;
  if (pathname.startsWith("/book/") || pathname === "/review") return false;
  return true;
}

export function MobileHomeSpacer() {
  const pathname = usePathname();
  if (!showMobileTabBar(pathname)) return null;

  return (
    <div
      className="h-[calc(var(--mobile-bar-height)+var(--safe-bottom))] md:hidden"
      aria-hidden
    />
  );
}

export function MobileHomeBar() {
  const pathname = usePathname();
  if (!showMobileTabBar(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-glam-border/80 bg-glam-secondary/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgba(15,15,15,0.08)] backdrop-blur-xl md:hidden"
      aria-label="Quick navigation"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2">
        {LINKS.map((item) => {
          const isActive = !("external" in item) && pathname === item.href;
          const className = cn(
            "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.65rem] font-semibold uppercase tracking-wide transition touch-manipulation",
            "primary" in item && item.primary
              ? "bg-glam-accent text-glam-primary shadow-soft"
              : isActive
                ? "bg-glam-accent/15 text-glam-primary"
                : "text-glam-primary/70 active:bg-glam-accent/10",
          );

          if ("external" in item && item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={className}
              >
                {item.label}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={className}>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
