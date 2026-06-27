import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <Section background="dark" className="!pb-8 sm:!pb-10">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="eyebrow-label text-glam-accent">{eyebrow}</p>
        <span className="gold-rule mx-auto" aria-hidden />
        <h1 className="heading-display mt-6 text-4xl text-glam-secondary sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 text-base leading-relaxed text-white/60">{description}</p>
        ) : null}
      </Reveal>
    </Section>
  );
}
