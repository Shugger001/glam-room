import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_DESCRIPTIONS,
  SERVICE_CATEGORY_HEROES,
  SERVICE_CATEGORY_ORDER,
  type ServiceCategory,
} from "@/lib/constants/services";

export function ServicesPreview() {
  return (
    <Section id="services" background="default">
      <SectionHeader
        eyebrow="Services"
        title="What we do"
        description="Installation, braids, hair reset — plus nails and makeup at Madina."
        align="left"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {SERVICE_CATEGORY_ORDER.map((category: ServiceCategory, i) => {
          const hero = SERVICE_CATEGORY_HEROES[category];
          return (
            <Reveal key={category} delay={i * 0.06}>
              <Link
                href={`/services/${category}`}
                className="group block overflow-hidden bg-glam-secondary/40 transition duration-200 hover:opacity-95 active:scale-[0.99]"
              >
                <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
                  <Image
                    src={hero.src}
                    alt={hero.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/80 via-glam-primary/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="heading-display text-2xl text-glam-secondary">
                      {SERVICE_CATEGORIES[category]}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {SERVICE_CATEGORY_DESCRIPTIONS[category]}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
      <Reveal className="mt-10">
        <ButtonLink href="/services" variant="outline" size="lg" className="!rounded-none">
          See all services
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
