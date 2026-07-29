import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <Section background="warm" className="!pb-8 !pt-10 sm:!pb-12 sm:!pt-14">
      <Reveal className="max-w-2xl">
        <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted sm:text-lg">
          {eyebrow}
        </p>
        <h1 className="heading-display mt-2 text-4xl text-glam-primary sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-glam-muted">{description}</p>
        ) : null}
      </Reveal>
    </Section>
  );
}
