import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";
import {
  groupServicesByCategory,
  type SalonService,
  type ServiceCategory,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_DESCRIPTIONS,
  SERVICE_CATEGORY_HEROES,
  serviceCategoryPath,
} from "@/lib/constants/services";
import { formatShopPrice } from "@/lib/format/money";

type ServicesByCategoryProps = {
  services: SalonService[];
};

/** Index: three category tiles that navigate to category pages. */
export function ServicesByCategory({ services }: ServicesByCategoryProps) {
  const groups = groupServicesByCategory(services);

  return (
    <div className="space-y-8 sm:space-y-10">
      <p className="max-w-md text-sm text-glam-muted sm:text-base">
        Choose a category to view styles and prices.
      </p>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {groups.map((group, index) => (
          <Link
            key={group.category}
            href={group.href}
            className="group relative aspect-[4/5] overflow-hidden text-left transition duration-300 ease-out touch-manipulation active:scale-[0.99] sm:aspect-[3/4]"
          >
            <Image
              src={group.hero.src}
              alt={group.hero.alt}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/85 via-glam-primary/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="font-[family-name:var(--font-cormorant)] text-sm italic text-glam-accent">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="heading-display mt-1 text-xl leading-tight text-glam-secondary sm:text-2xl">
                {group.label}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/65 sm:text-sm">
                {group.description}
              </p>
              <p className="mt-3 text-[0.65rem] font-medium tracking-wide text-glam-accent">
                View styles →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

type CategoryServicesMenuProps = {
  category: ServiceCategory;
  services: SalonService[];
};

/** Dedicated category page: hero + sub-service price list. */
export function CategoryServicesMenu({ category, services }: CategoryServicesMenuProps) {
  const items = services.filter((s) => s.category === category);
  const hero = SERVICE_CATEGORY_HEROES[category];
  const label = SERVICE_CATEGORIES[category];
  const description = SERVICE_CATEGORY_DESCRIPTIONS[category];

  return (
    <div>
      <div className="relative mb-10 aspect-[21/9] min-h-[12rem] overflow-hidden sm:mb-12 sm:min-h-[16rem]">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-glam-primary/75 via-glam-primary/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-accent">
            Glam Room
          </p>
          <h2 className="heading-display mt-1 text-3xl text-glam-secondary sm:text-4xl lg:text-5xl">
            {label}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">{description}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm tabular-nums text-glam-muted">
          {items.length} {items.length === 1 ? "style" : "styles"}
        </p>
        <Link
          href="/services"
          className="text-sm text-glam-muted transition hover:text-glam-accent"
        >
          ← All categories
        </Link>
      </div>

      <ul className="divide-y divide-glam-border/70 border-y border-glam-border/70">
        {items.map((service) => (
          <li key={service.id}>
            <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-6">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/services/${service.slug}`}
                  className="heading-display text-xl text-glam-primary transition duration-200 hover:text-glam-accent sm:text-2xl"
                >
                  {service.name}
                </Link>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-glam-muted">
                  {service.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5 sm:gap-7">
                <p className="text-lg font-semibold tabular-nums text-glam-primary">
                  {formatShopPrice(service.price)}
                </p>
                <ButtonLink
                  href={`/book?service=${service.id}`}
                  size="sm"
                  variant="accent"
                  className="!rounded-none min-w-[5.5rem] justify-center"
                >
                  Book
                </ButtonLink>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {category === "braids" ? (
        <p className="mt-5 text-sm text-glam-muted" role="note">
          {BRAND.copy.braidsNotice}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        {(["hair-installation", "braids", "hair-reset"] as ServiceCategory[])
          .filter((c) => c !== category)
          .map((c) => (
            <ButtonLink
              key={c}
              href={serviceCategoryPath(c)}
              variant="outline"
              size="sm"
              className="!rounded-none"
            >
              {SERVICE_CATEGORIES[c]}
            </ButtonLink>
          ))}
      </div>
    </div>
  );
}

export function ServicesPreview({ services }: { services: SalonService[] }) {
  return (
    <Section id="services" background="default">
      <SectionHeader
        eyebrow="Services"
        title="What we offer"
        description="Choose a category to see styles and prices."
        align="left"
      />
      <ServicesByCategory services={services} />
    </Section>
  );
}
