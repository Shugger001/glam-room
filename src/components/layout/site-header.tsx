"use client";

import { m, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { GlamLogo } from "@/components/brand/glam-logo";
import { PRIMARY_NAV } from "@/lib/constants/navigation";
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
      <m.header
        initial={false}
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-[var(--header-height)] overflow-visible border-b transition-[border-color,background-color] duration-500",
          showSolidHeader
            ? "border-glam-border bg-glam-secondary/90 shadow-[var(--shadow-glass)] backdrop-blur-xl"
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
                  "relative transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-glam-accent after:transition-transform hover:after:scale-x-100",
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
            <Link
              href="/auth"
              className={cn(
                "hidden rounded-full px-3 py-1.5 text-sm font-medium transition md:inline-flex",
                showSolidHeader
                  ? "text-glam-primary/75 hover:bg-glam-accent/15 hover:text-glam-primary"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              Account
            </Link>
            <ButtonLink
              href="/book"
              size="sm"
              variant={showSolidHeader ? "primary" : "accent"}
              className="flex min-h-9 items-center sm:hidden"
            >
              Book
            </ButtonLink>
            <ButtonLink
              href="/book"
              size="sm"
              variant={showSolidHeader ? "primary" : "accent"}
              className="hidden sm:inline-flex"
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
            className="fixed inset-0 z-40 lg:hidden"
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
                {PRIMARY_NAV.map((item, i) => (
                  <m.li
                    key={item.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.04, duration: 0.35 }}
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
              <div className="mt-auto flex flex-col gap-3 border-t border-glam-border pt-6">
                <Link
                  href="/auth"
                  className="flex min-h-12 items-center justify-center rounded-xl border border-glam-border text-base font-semibold text-glam-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
                <ButtonLink
                  href="/book"
                  size="lg"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Book Appointment
                </ButtonLink>
              </div>
            </m.nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
