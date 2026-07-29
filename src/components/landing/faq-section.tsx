import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeader } from "@/components/ui/section";
import type { FaqItem } from "@/lib/constants/faqs";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item.id} delay={i * 0.04}>
          <article>
            <h3 className="heading-display text-xl text-glam-primary sm:text-2xl">
              {item.question}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-glam-muted sm:text-base">
              {item.answer}
            </p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

/** @deprecated Prefer FaqList — kept as alias for existing imports */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return <FaqList items={items} />;
}

export function FaqPreview({ items }: { items: FaqItem[] }) {
  return (
    <Section id="faq" background="default">
      <SectionHeader
        eyebrow="Help"
        title="Common questions"
        description="Booking, deposits, and what to expect at your visit."
        align="left"
      />
      <FaqList items={items.slice(0, 4)} />
    </Section>
  );
}
