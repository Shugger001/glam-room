"use client";

import { m, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { GlamLogo } from "@/components/brand/glam-logo";
import { PRIMARY_NAV } from "@/lib/constants/navigation";
import { BRAND } from "@/lib/constants/brand";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const showSolidHeader = !isHome || scrolled;

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-glam-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-glam-primary"
      >
        Skip to content
      </a>
      <m.header
        initial={false}
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-[calc(var(--header-height)+env(safe-area-inset-top,0px))] overflow-visible border-b pt-[env(safe-area-inset-top,0px)] transition-[border-color,background-color] duration-500",
          showSolidHeader
            ? "border-glam-border/80 border-b-glam-accent/10 bg-glam-secondary/92 shadow-[var(--shadow-glass)] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3 overflow-visible px-5 sm:gap-5 sm:px-8">
          <GlamLogo variant={showSolidHeader ? "default" : "onDark"} />

          <nav
            className={cn(
              "hidden items-center gap-6 text-sm font-medium lg:flex xl:gap-8",
              showSolidHeader ? "text-glam-primary/75" : "text-white/80",
            )}
            aria-label="Primary"
          >
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative tracking-wide transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-glam-accent-deep after:to-glam-accent-light after:transition-transform hover:after:scale-x-100",
                  showSolidHeader
                    ? "hover:text-glam-primary"
                    : "hover:text-glam-secondary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ButtonLink
              href="/book"
              size="sm"
              variant={showSolidHeader ? "primary" : "accent"}
              className={cn(
                "inline-flex min-h-9 items-center",
                isHome && "hidden sm:inline-flex",
              )}
            >
              Book
            </ButtonLink>
            <button
              type="button"
              className={cn(
                "flex min-h-11 min-w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm lg:hidden",
                showSolidHeader
                  ? "border-glam-border bg-glam-secondary/80 text-glam-primary"
                  : "border-white/25 bg-white/10 text-white",
              )}
              aria-expanded={menuOpen}
              aria-controls="mobile-primary-nav"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span
                  className={cn(
                    "block h-0.5 w-6 rounded-full transition-transform",
                    showSolidHeader ? "bg-glam-primary" : "bg-white",
                    menuOpen && "translate-y-2 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-6 rounded-full transition-opacity",
                    showSolidHeader ? "bg-glam-primary" : "bg-white",
                    menuOpen && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-6 rounded-full transition-transform",
                    showSolidHeader ? "bg-glam-primary" : "bg-white",
                    menuOpen && "-translate-y-2 -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </m.header>

      <AnimatePresence>
        {menuOpen ? (
          <m.div
            id="mobile-primary-nav"
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-glam-primary/40 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <m.nav
              className="absolute inset-0 flex flex-col bg-glam-secondary px-6 pb-10 pt-[calc(var(--header-height)+1.5rem)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              aria-label="Primary mobile"
            >
              <ul className="flex flex-1 flex-col gap-1">
                <m.li
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04, duration: 0.35 }}
                >
                  <Link
                    href="/"
                    className="flex min-h-12 items-center rounded-xl px-4 text-lg font-medium tracking-tight text-glam-primary transition hover:bg-glam-accent/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    Home
                  </Link>
                </m.li>
                {PRIMARY_NAV.map((item, i) => (
                  <m.li
                    key={item.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.04, duration: 0.35 }}
                  >
                    <Link
                      href={item.href}
                      className="flex min-h-12 items-center rounded-xl px-4 text-lg font-medium tracking-tight text-glam-primary transition hover:bg-glam-accent/10"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </m.li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3 border-t border-glam-border pt-6 pb-[env(safe-area-inset-bottom)]">
                <ButtonLink
                  href="/book"
                  size="lg"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Book Appointment
                </ButtonLink>
                <a
                  href={BRAND.links.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-12 w-full items-center justify-center rounded-full border border-glam-border text-sm font-semibold text-glam-primary transition hover:border-glam-accent hover:text-glam-accent"
                  onClick={() => setMenuOpen(false)}
                >
                  WhatsApp Glam Room
                </a>
              </div>
            </m.nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
