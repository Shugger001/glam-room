"use client";

import { m, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/button";
import { MagneticWrap } from "@/components/motion/magnetic-wrap";
import { HeroRotator } from "@/components/landing/hero-rotator";
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
      className="relative -mt-[var(--header-height)] min-h-[100svh] overflow-hidden bg-glam-primary"
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,15,15,0.35)_100%)]" />
      </m.div>

      <m.div
        className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 pb-28 pt-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1.5rem)] text-center sm:px-8 sm:pb-24"
        style={{ y: contentY, opacity }}
      >
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 eyebrow-label text-glam-accent"
        >
          🇬🇭 3 Locations · Accra
        </m.p>
        <span className="mb-6 block h-px w-16 bg-gradient-to-r from-transparent via-glam-accent/80 to-transparent" aria-hidden />

        <m.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="heading-display max-w-4xl text-4xl leading-[1.05] text-glam-secondary sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Your Crown.
          <br />
          <span className="text-glam-accent">Your Glow.</span>
        </m.h1>

        <HeroRotator />

        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4"
        >
          <MagneticWrap className="w-full sm:w-auto">
            <ButtonLink
              href="/book"
              variant="accent"
              size="lg"
              className="w-full justify-center sm:w-auto"
              onClick={() => track("hero_cta_book")}
            >
              Book Your Glow Up
            </ButtonLink>
          </MagneticWrap>
          <MagneticWrap className="w-full sm:w-auto">
            <ButtonLink
              href="/#services"
              variant="outline"
              size="lg"
              className="w-full justify-center border-white/30 text-glam-secondary hover:border-glam-accent hover:text-glam-accent sm:w-auto"
              onClick={() => track("hero_cta_services")}
            >
              View Services
            </ButtonLink>
          </MagneticWrap>
        </m.div>
      </m.div>

      <m.div
        className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 sm:bottom-8 sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        aria-hidden
      >
        <m.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-white/50">
            Scroll
          </span>
          <span className="block h-10 w-px bg-gradient-to-b from-glam-accent to-transparent" />
        </m.div>
      </m.div>
    </section>
  );
}
