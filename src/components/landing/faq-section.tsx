"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeader } from "@/components/ui/section";
import { cn } from "@/lib/utils/cn";
import type { FaqItem } from "@/lib/constants/faqs";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openId === item.id;
        return (
          <Reveal key={item.id} delay={i * 0.05}>
            <div className="overflow-hidden rounded-xl border border-glam-border bg-glam-secondary">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-glam-primary">{item.question}</span>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-glam-border text-glam-accent transition-transform duration-300",
                    isOpen && "rotate-45",
                  )}
                  aria-hidden
                >
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="border-t border-glam-border px-6 py-5 text-sm leading-relaxed text-glam-muted">
                      {item.answer}
                    </p>
                  </m.div>
                ) : null}
              </AnimatePresence>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

export function FaqPreview({ items }: { items: FaqItem[] }) {
  return (
    <Section id="faq" background="white">
      <SectionHeader
        eyebrow="FAQs"
        title="Questions & Answers"
        description="Everything you need to know before your visit. Can't find what you're looking for? Contact us directly."
        align="center"
      />
      <div className="mx-auto max-w-3xl">
        <FaqAccordion items={items.slice(0, 4)} />
      </div>
    </Section>
  );
}
