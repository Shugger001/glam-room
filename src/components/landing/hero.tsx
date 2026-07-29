"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";

const HERO_IMAGE = "/images/glam-braids-studio.png";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function LandingHero() {
  return (
    <section
      className="relative -mt-[var(--header-height)] flex min-h-[min(100dvh,52rem)] flex-col justify-center overflow-hidden bg-glam-primary sm:min-h-[84svh] md:min-h-[88svh]"
      aria-label="Hero"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Glam Room by Asantewaa salon"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-70 sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-glam-primary/55 via-glam-primary/40 to-glam-primary/88" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 pb-14 pt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+2rem)] text-center sm:px-8 sm:pb-20">
        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          className="font-[family-name:var(--font-cormorant)] text-xl italic tracking-wide text-glam-accent sm:text-2xl"
        >
          Glam Room
        </m.p>

        <m.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: EASE_OUT }}
          className="heading-display mt-3 max-w-lg text-4xl leading-[1.06] text-glam-secondary sm:text-5xl md:text-6xl"
        >
          Your Crown.
          <br />
          Your Glow.
        </m.h1>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.22, ease: EASE_OUT }}
          className="mt-4 max-w-sm text-sm leading-relaxed text-white/65 sm:text-base"
        >
          Accra beauty, three shops — book your chair.
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.32, ease: EASE_OUT }}
          className="mt-9 w-full max-w-xs"
        >
          <ButtonLink
            href="/book"
            variant="accent"
            size="lg"
            className="w-full justify-center !rounded-none"
            onClick={() => track("hero_cta_book")}
          >
            Book now
          </ButtonLink>
        </m.div>
      </div>
    </section>
  );
}
