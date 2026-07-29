import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { formatShopPrice } from "@/lib/format/money";
import type { SalonService } from "@/lib/constants/services";

type ServiceCardProps = {
  service: SalonService;
  index?: number;
  disableReveal?: boolean;
};

export function ServiceCard({ service, index = 0, disableReveal = false }: ServiceCardProps) {
  const card = (
    <article className="group flex h-full flex-col">
      <Link
        href={`/services/${service.slug}`}
        className="relative aspect-square overflow-hidden sm:aspect-[4/3]"
      >
        <Image
          src={service.image}
          alt={service.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col pt-3 sm:pt-5">
        <p className="text-xs text-glam-muted">{service.durationMinutes} min</p>
        <h3 className="heading-display mt-1 text-base leading-tight text-glam-primary sm:text-2xl">
          <Link href={`/services/${service.slug}`} className="transition hover:text-glam-accent">
            {service.name}
          </Link>
        </h3>
        <p className="mt-2 hidden flex-1 text-sm leading-relaxed text-glam-muted sm:block">
          {service.description}
        </p>
        <div className="mt-3 flex flex-col gap-2 border-t border-glam-border/70 pt-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
          <p className="text-sm font-semibold tabular-nums text-glam-primary sm:text-lg">
            {formatShopPrice(service.price)}
          </p>
          <ButtonLink
            href={`/book?service=${service.id}`}
            size="sm"
            variant="accent"
            className="w-full justify-center !rounded-none px-3 py-2 text-xs sm:w-auto"
          >
            Book
          </ButtonLink>
        </div>
      </div>
    </article>
  );

  if (disableReveal) return card;

  return (
    <Reveal delay={index * 0.06} className="group">
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
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
      {items.map((service, i) => (
        <ServiceCard key={service.id} service={service} index={i} />
      ))}
    </div>
  );
}
