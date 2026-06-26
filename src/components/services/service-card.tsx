import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { ServicesInteractiveGrid } from "@/components/services/services-interactive-grid";
import { Section, SectionHeader } from "@/components/ui/section";
import { formatShopPrice } from "@/lib/format/money";
import type { SalonService } from "@/lib/constants/services";

type ServiceCardProps = {
  service: SalonService;
  index?: number;
  disableReveal?: boolean;
};

export function ServiceCard({ service, index = 0, disableReveal = false }: ServiceCardProps) {
  const card = (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-glam-secondary shadow-soft transition-shadow duration-500 hover:shadow-premium">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={service.image}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-glam-accent">
            {service.durationMinutes} min
          </p>
          <h3 className="heading-display mt-2 text-2xl text-glam-primary">{service.name}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-glam-muted">
            {service.description}
          </p>
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-glam-border pt-5">
            <p className="text-lg font-semibold text-glam-primary">
              {formatShopPrice(service.price)}
            </p>
            <ButtonLink href={`/book?service=${service.id}`} size="sm" variant="accent">
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        eyebrow="What We Do"
        title="Services That Slay"
        description="Pick your vibe and let us work our magic. Every service comes with main character energy included."
        align="center"
      />
      <ServicesInteractiveGrid services={services} />
      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-glam-muted" role="note">
        Please note that all Braids prices do not include hair extensions. You can either come along
        with your own extensions or purchase from our salon.
      </p>
    </Section>
  );
}
