import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ServicesGrid } from "@/components/services/service-card";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { BRAND } from "@/lib/constants/brand";
import {
  groupServicesByCategory,
  type SalonService,
} from "@/lib/constants/services";
import { formatShopPrice } from "@/lib/format/money";

type ServicesByCategoryProps = {
  services: SalonService[];
  /** Card grid or compact price list (default) */
  layout?: "cards" | "list";
};

export function ServicesByCategory({
  services,
  layout = "list",
}: ServicesByCategoryProps) {
  const groups = groupServicesByCategory(services);

  return (
    <div className="space-y-14 sm:space-y-16">
      {groups.map((group, groupIndex) => (
        <section key={group.category} aria-labelledby={`service-cat-${group.category}`}>
          <Reveal delay={groupIndex * 0.04}>
            <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted sm:text-lg">
              {String(groupIndex + 1).padStart(2, "0")}
            </p>
            <h2
              id={`service-cat-${group.category}`}
              className="heading-display mt-1 text-2xl text-glam-primary sm:text-3xl"
            >
              {group.label}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-glam-muted">{group.description}</p>
          </Reveal>

          {layout === "cards" ? (
            <div className="mt-8">
              <ServicesGrid services={group.items} />
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-glam-border/70 border-y border-glam-border/70">
              {group.items.map((service, i) => (
                <li key={service.id}>
                  <Reveal delay={0.03 + i * 0.03}>
                    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/services/${service.slug}`}
                          className="heading-display text-xl text-glam-primary transition hover:text-glam-accent sm:text-2xl"
                        >
                          {service.name}
                        </Link>
                        <p className="mt-1 text-sm text-glam-muted">{service.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
                        <p className="text-base font-semibold tabular-nums text-glam-primary sm:text-lg">
                          {formatShopPrice(service.price)}
                        </p>
                        <ButtonLink
                          href={`/book?service=${service.id}`}
                          size="sm"
                          variant="accent"
                          className="!rounded-none"
                        >
                          Book
                        </ButtonLink>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}

          {group.category === "braids" ? (
            <p className="mt-4 text-sm text-glam-muted" role="note">
              {BRAND.copy.braidsNotice}
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}

export function ServicesPreview({ services }: { services: SalonService[] }) {
  return (
    <Section id="services" background="default">
      <SectionHeader
        eyebrow="Services"
        title="What we offer"
        description="Hair installation, braiding, and hair reset — pick a look and book."
        align="left"
      />
      <ServicesByCategory services={services} layout="list" />
    </Section>
  );
}
