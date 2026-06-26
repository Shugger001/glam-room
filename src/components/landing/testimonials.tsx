"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeader } from "@/components/ui/section";
import type { Testimonial } from "@/lib/constants/testimonials";
import { cn } from "@/lib/utils/cn";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn("text-sm", i < rating ? "text-glam-accent" : "text-glam-border")}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const current = testimonials[active];

  return (
    <Section id="testimonials" background="dark">
      <SectionHeader
        eyebrow="Love Notes"
        title="What the Girls Are Saying"
        description="Don't just take our word for it. Hear from the queens who've sat in our chair."
        align="center"
        className="[&_h2]:text-glam-secondary [&_p]:text-white/60 [&_span]:text-glam-accent"
      />

      <Reveal className="mx-auto max-w-3xl text-center">
        <AnimatePresence mode="wait">
          <m.blockquote
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <StarRating rating={current.rating} />
            <p className="heading-display mt-6 text-2xl leading-relaxed text-glam-secondary sm:text-3xl">
              &ldquo;{current.quote}&rdquo;
            </p>
            <footer className="mt-8">
              <cite className="not-italic">
                <span className="block text-base font-semibold text-glam-secondary">
                  {current.name}
                </span>
                <span className="mt-1 block text-sm text-glam-accent">{current.service}</span>
              </cite>
            </footer>
          </m.blockquote>
        </AnimatePresence>

        <div className="mt-10 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === active ? "w-8 bg-glam-accent" : "w-2 bg-white/30 hover:bg-white/50",
              )}
              aria-label={`View testimonial from ${t.name}`}
              aria-current={i === active ? "true" : undefined}
            />
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
