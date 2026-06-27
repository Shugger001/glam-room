"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";

const HERO_IMAGE = "/images/glam-braids-studio.png";

export function LandingHero() {
  return (
    <section
      className="relative -mt-[var(--header-height)] flex min-h-[52svh] flex-col justify-center overflow-hidden bg-glam-primary sm:min-h-[58svh] md:min-h-[62svh]"
      aria-label="Hero"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Glam Room by Asantewaa salon"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-glam-primary/60 via-glam-primary/45 to-glam-primary/90" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 pb-6 pt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1rem)] text-center sm:px-8">
        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="heading-display max-w-lg text-4xl leading-[1.08] text-glam-secondary sm:text-5xl"
        >
          Your Crown.
          <br />
          <span className="text-glam-accent">Your Glow.</span>
        </m.h1>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="eyebrow-label mt-4 text-white/60"
        >
          Accra · 3 shops
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 w-full max-w-xs"
        >
          <ButtonLink
            href="/book"
            variant="accent"
            size="lg"
            className="w-full justify-center"
            onClick={() => track("hero_cta_book")}
          >
            Book Now
          </ButtonLink>
        </m.div>
      </div>
    </section>
  );
}
