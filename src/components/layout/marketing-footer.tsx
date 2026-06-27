"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { GlamLogo } from "@/components/brand/glam-logo";
import { BRAND } from "@/lib/constants/brand";

function CompactHomeFooter() {
  return (
    <footer className="border-t border-glam-border/60 bg-glam-primary py-5 text-center md:hidden">
      <GlamLogo variant="onDark" asLink={false} className="mx-auto scale-90" />
      <div className="mt-3 flex justify-center gap-4 text-xs font-semibold uppercase tracking-wider">
        <a href={BRAND.links.whatsapp} target="_blank" rel="noreferrer" className="text-glam-accent">
          WhatsApp
        </a>
        <Link href="/about" className="text-white/60">
          Shops
        </Link>
        <Link href="/faq" className="text-white/60">
          Help
        </Link>
      </div>
    </footer>
  );
}

function MinimalDesktopHomeFooter() {
  return (
    <footer className="hidden border-t border-white/10 bg-glam-primary py-8 text-center text-xs text-white/40 md:block">
      <p>
        © {new Date().getFullYear()} {BRAND.fullName}
      </p>
    </footer>
  );
}

export function MarketingFooter({ fullFooter }: { fullFooter: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") {
    return (
      <>
        <CompactHomeFooter />
        <MinimalDesktopHomeFooter />
      </>
    );
  }

  return fullFooter;
}
