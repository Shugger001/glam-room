import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { ServicesInteractiveGrid } from "@/components/services/services-interactive-grid";
import { Section, SectionHeader } from "@/components/ui/section";
import { formatShopPrice } from "@/lib/format/money";
import { BRAND } from "@/lib/constants/brand";
import type { SalonService } from "@/lib/constants/services";

type ServiceCardProps = {
  service: SalonService;
  index?: number;
  disableReveal?: boolean;
};

export function ServiceCard({ service, index = 0, disableReveal = false }: ServiceCardProps) {
  const card = (
    <article className="premium-card group flex h-full flex-col !rounded-xl sm:!rounded-2xl">
        <div className="relative aspect-square overflow-hidden sm:aspect-[4/3]">
          <Image
            src={service.image}
            alt={service.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-glam-accent sm:text-xs sm:tracking-[0.2em]">
            {service.durationMinutes} min
          </p>
          <h3 className="heading-display mt-1 text-base leading-tight text-glam-primary sm:mt-2 sm:text-2xl">
            {service.name}
          </h3>
          <p className="mt-2 hidden flex-1 text-sm leading-relaxed text-glam-muted sm:mt-3 sm:block">
            {service.description}
          </p>
          <div className="mt-3 flex flex-col gap-2 border-t border-glam-border pt-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-5">
            <p className="text-sm font-semibold text-glam-primary sm:text-lg">
              {formatShopPrice(service.price)}
            </p>
            <ButtonLink
              href={`/book?service=${service.id}`}
              size="sm"
              variant="accent"
              className="w-full justify-center px-3 py-2 text-[0.65rem] sm:w-auto sm:px-4 sm:text-xs"
            >
              Book Now
            </ButtonLink>
          </div>
        </div>
      </article>
  );

  if (disableReveal) return card;

  return (
    <Reveal delay={index * 0.08} className="group">
      {card}
    </Reveal>
  );
}

type ServicesGridProps = {
  services: SalonService[];
  limit?: number;
};

export function ServicesGrid({ services, limit }: ServicesGridProps) {
  const items = limit ? services.slice(0, limit) : services;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
      {items.map((service, i) => (
        <ServiceCard key={service.id} service={service} index={i} />
      ))}
    </div>
  );
}

export function ServicesPreview({ services }: { services: SalonService[] }) {
  return (
    <Section id="services" background="white">
      <SectionHeader
        eyebrow="Services"
        title="Services"
        description="Pick one and book."
        align="center"
      />
      <ServicesInteractiveGrid services={services} />
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-glam-muted" role="note">
        {BRAND.copy.braidsNotice}
      </p>
    </Section>
  );
}
