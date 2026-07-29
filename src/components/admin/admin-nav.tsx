"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminNavGroup } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminNavProps = {
  groups: AdminNavGroup[];
  className?: string;
  orientation?: "vertical" | "horizontal";
};

export function AdminNav({ groups, className, orientation = "vertical" }: AdminNavProps) {
  const pathname = usePathname() ?? "";

  if (orientation === "horizontal") {
    const items = groups.flatMap((g) => g.items);
    return (
      <nav className={cn("-mx-1", className)} aria-label="Admin">
        <div className="flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-[background-color,color] duration-150",
                  active
                    ? "bg-glam-accent/15 text-glam-accent"
                    : "text-white/65 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn("space-y-5", className)} aria-label="Admin">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">
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
                      "relative block rounded-md px-3 py-2 text-sm font-medium transition-[background-color,color] duration-150",
                      active
                        ? "bg-glam-accent/15 text-glam-accent"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active ? (
                      <span
                        className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-glam-accent"
                        aria-hidden
                      />
                    ) : null}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
