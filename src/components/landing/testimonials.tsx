import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeader } from "@/components/ui/section";
import type { Testimonial } from "@/lib/constants/testimonials";
import { cn } from "@/lib/utils/cn";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn("text-xs", i < rating ? "text-glam-accent" : "text-glam-border")}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function TestimonialsSection({
  testimonials,
  showHeader = true,
}: {
  testimonials: Testimonial[];
  showHeader?: boolean;
}) {
  if (!testimonials.length) return null;

  const [lead, ...rest] = testimonials;
  const wall = rest.slice(0, 4);

  return (
    <Section id="testimonials" background="default" className={!showHeader ? "!pt-0" : undefined}>
      {showHeader ? (
        <SectionHeader
          eyebrow="Client notes"
          title="What they leave with"
          description="Real words from clients who sat in our chairs across Accra."
          align="left"
        />
      ) : null}

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        {lead ? (
          <Reveal className="lg:col-span-5">
            <blockquote className="border-l border-glam-accent/50 pl-6">
              <StarRating rating={lead.rating} />
              <p className="heading-display mt-5 text-3xl leading-snug text-glam-primary sm:text-4xl">
                &ldquo;{lead.quote}&rdquo;
              </p>
              <footer className="mt-8">
                <cite className="not-italic">
                  <span className="block text-sm font-semibold text-glam-primary">{lead.name}</span>
                  <span className="mt-1 block text-sm text-glam-muted">{lead.service}</span>
                </cite>
              </footer>
            </blockquote>
          </Reveal>
        ) : null}

        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
          {wall.map((item, i) => (
            <Reveal key={item.id} delay={0.06 + i * 0.05}>
              <blockquote className="h-full">
                <StarRating rating={item.rating} />
                <p className="mt-3 text-base leading-relaxed text-glam-primary/85">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-4">
                  <cite className="not-italic">
                    <span className="block text-sm font-medium text-glam-primary">{item.name}</span>
                    <span className="mt-0.5 block text-xs text-glam-muted">{item.service}</span>
                  </cite>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
