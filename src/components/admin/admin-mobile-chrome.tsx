"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminNavGroup } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminMobileChromeProps = {
  groups: AdminNavGroup[];
  isSuperAdmin: boolean;
  shopLabel: string | null;
  signOut: () => Promise<void>;
};

export function AdminMobileChrome({
  groups,
  isSuperAdmin,
  shopLabel,
  signOut,
}: AdminMobileChromeProps) {
  const pathname = usePathname() ?? "";
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetId = useId();

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  const primaryTabs = isSuperAdmin
    ? [
        { href: "/admin", label: "Overview" },
        { href: "/admin/appointments", label: "Appts" },
        { href: "/admin/messages", label: "Inbox" },
        { href: "/admin/customers", label: "CRM" },
      ]
    : [
        { href: "/admin", label: "Today" },
        { href: "/admin/appointments", label: "Appts" },
      ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-glam-primary/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-glam-accent">
              {isSuperAdmin ? "Super admin" : "Staff"}
              {shopLabel ? ` · ${shopLabel}` : ""}
            </p>
            <p className="font-display truncate text-base leading-tight text-white">Glam Room</p>
          </div>
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-3 text-xs font-semibold uppercase tracking-wider text-white/80 active:scale-[0.98]"
            aria-expanded={moreOpen}
            aria-controls={sheetId}
          >
            More
          </button>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center px-2 text-xs font-semibold uppercase tracking-wider text-white/55 active:scale-[0.98] active:text-white"
            >
              Out
            </button>
          </form>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-glam-primary/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Primary admin"
      >
        <div className={cn("grid", isSuperAdmin ? "grid-cols-5" : "grid-cols-3")}>
          {primaryTabs.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center px-1 text-[0.7rem] font-semibold tracking-wide transition-[color,background-color] duration-150",
                  active ? "bg-glam-accent/10 text-glam-accent" : "text-white/60 active:bg-white/5",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex min-h-12 flex-col items-center justify-center px-1 text-[0.7rem] font-semibold tracking-wide text-white/60 active:bg-white/5"
            aria-expanded={moreOpen}
            aria-controls={sheetId}
          >
            More
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby={`${sheetId}-title`}>
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <div
            id={sheetId}
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-white/10 bg-glam-primary pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)]"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-glam-primary px-4 py-3">
              <h2 id={`${sheetId}-title`} className="font-display text-lg text-white">
                Menu
              </h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="inline-flex min-h-11 items-center px-2 text-xs font-semibold uppercase tracking-wider text-white/60"
              >
                Close
              </button>
            </div>
            <div className="space-y-5 px-3 py-4">
              {groups.map((group) => (
                <div key={group.id}>
                  <p className="mb-1.5 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "block rounded-md px-3 py-3 text-sm font-medium",
                              active
                                ? "bg-glam-accent/15 text-glam-accent"
                                : "text-white/80 active:bg-white/5",
                            )}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <form action={signOut} className="border-t border-white/10 pt-3">
                <button
                  type="submit"
                  className="w-full rounded-md border border-white/20 px-3 py-3 text-sm font-semibold uppercase tracking-wider text-white/70 active:bg-white/5"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
