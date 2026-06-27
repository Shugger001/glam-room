"use client";

import { m, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-wrap";
import { track } from "@/lib/analytics/track";

const HERO_IMAGE = "/images/glam-braids-studio.png";

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.14]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);

  return (
    <section
      ref={sectionRef}
      className="relative -mt-[var(--header-height)] min-h-[88svh] overflow-hidden bg-glam-primary"
      aria-label="Hero"
    >
      <m.div className="pointer-events-none absolute inset-0 origin-center" style={{ y: bgY, scale: bgScale }}>
        <Image
          src={HERO_IMAGE}
          alt="Glam Room by Asantewaa salon"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-glam-primary/60 via-glam-primary/40 to-glam-primary/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-glam-primary/50 to-transparent" />
      </m.div>

      <m.div
        className="relative z-10 flex min-h-[88svh] flex-col items-center justify-center px-4 pb-24 pt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1.5rem)] text-center sm:px-8"
        style={{ y: contentY, opacity }}
      >
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 eyebrow-label text-glam-accent"
        >
          🇬🇭 Accra · 3 shops
        </m.p>
        <span className="mb-6 block h-px w-16 bg-gradient-to-r from-transparent via-glam-accent/80 to-transparent" aria-hidden />

        <m.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="heading-display max-w-4xl text-4xl leading-[1.05] text-glam-secondary sm:text-6xl md:text-7xl"
        >
          Your Crown.
          <br />
          <span className="text-glam-accent">Your Glow.</span>
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-5 max-w-md text-base text-white/75 sm:text-lg"
        >
          Braids, installs, silk presses. Adenta, Sowutuom, Madina.
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4"
        >
          <MagneticWrap className="w-full sm:w-auto">
            <ButtonLink
              href="/book"
              variant="accent"
              size="lg"
              className="w-full justify-center sm:w-auto"
              onClick={() => track("hero_cta_book")}
            >
              Book Now
            </ButtonLink>
          </MagneticWrap>
          <MagneticWrap className="w-full sm:w-auto">
            <ButtonLink
              href="/services"
              variant="outline"
              size="lg"
              className="w-full justify-center border-white/30 text-glam-secondary hover:border-glam-accent hover:text-glam-accent sm:w-auto"
              onClick={() => track("hero_cta_services")}
            >
              Services
            </ButtonLink>
          </MagneticWrap>
        </m.div>
      </m.div>
    </section>
  );
}
