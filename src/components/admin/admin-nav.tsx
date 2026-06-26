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
    return (
      <nav className={cn("flex flex-col gap-4", className)} aria-label="Admin">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/40">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition",
                      active
                        ? "border-glam-accent/60 bg-glam-accent/15 text-glam-accent"
                        : "border-white/10 text-white/70 hover:border-glam-accent/40 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className={cn("space-y-6", className)} aria-label="Admin">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/40">
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
                      "block rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-glam-accent/15 text-glam-accent"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
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
    </nav>
  );
}
