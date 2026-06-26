"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MARKETING_PATHS = new Set(["/book"]);

export function FloatingBookCta() {
  const pathname = usePathname();

  if (!MARKETING_PATHS.has(pathname)) return null;

  return (
    <m.div
      className="fixed bottom-5 right-4 z-40 pb-[env(safe-area-inset-bottom)] md:hidden"
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href="/book"
        className="flex items-center gap-2 rounded-full bg-glam-accent px-5 py-3 text-sm font-semibold text-glam-primary shadow-premium"
        aria-label="Book appointment"
      >
        Book Now
      </Link>
    </m.div>
  );
}
