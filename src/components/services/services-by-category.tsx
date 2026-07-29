"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";
import {
  groupServicesByCategory,
  type SalonService,
  type ServiceCategory,
} from "@/lib/constants/services";
import { formatShopPrice } from "@/lib/format/money";
import { cn } from "@/lib/utils/cn";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type ServicesByCategoryProps = {
  services: SalonService[];
};

export function ServicesByCategory({ services }: ServicesByCategoryProps) {
  const groups = groupServicesByCategory(services);
  const [selected, setSelected] = useState<ServiceCategory | null>(null);
  const active = groups.find((g) => g.category === selected) ?? null;

  return (
    <div className="space-y-10 sm:space-y-12">
      <p className="max-w-md text-sm text-glam-muted sm:text-base">
        Choose a category to view styles and prices.
      </p>

      <div
        className="grid gap-3 sm:grid-cols-3 sm:gap-4"
        role="tablist"
        aria-label="Service categories"
      >
        {groups.map((group, index) => {
          const isSelected = selected === group.category;
          return (
            <button
              key={group.category}
              type="button"
              role="tab"
              id={`service-tab-${group.category}`}
              aria-selected={isSelected}
              aria-controls={`service-panel-${group.category}`}
              onClick={() =>
                setSelected((current) =>
                  current === group.category ? null : group.category,
                )
              }
              className={cn(
                "group relative aspect-[4/5] overflow-hidden text-left transition duration-300 ease-out touch-manipulation active:scale-[0.99] sm:aspect-[3/4]",
                isSelected
                  ? "ring-2 ring-glam-accent ring-offset-2 ring-offset-glam-background"
                  : "opacity-90 hover:opacity-100",
              )}
            >
              <Image
                src={group.hero.src}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className={cn(
                  "object-cover transition duration-500 ease-out",
                  isSelected ? "scale-105" : "group-hover:scale-[1.03]",
                )}
                priority={index === 0}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t transition duration-300",
                  isSelected
                    ? "from-glam-primary/90 via-glam-primary/45 to-glam-primary/15"
                    : "from-glam-primary/80 via-glam-primary/35 to-transparent",
                )}
              />
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
                <p
                  className={cn(
                    "mt-3 text-[0.65rem] font-medium tracking-wide transition",
                    isSelected ? "text-glam-accent" : "text-white/50",
                  )}
                >
                  {isSelected ? "Selected" : "View styles"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <m.div
            key={active.category}
            id={`service-panel-${active.category}`}
            role="tabpanel"
            aria-labelledby={`service-tab-${active.category}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="border-t border-glam-border/80 pt-8 sm:pt-10"
          >
            <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted">
                  Menu
                </p>
                <h2 className="heading-display mt-1 text-3xl text-glam-primary sm:text-4xl">
                  {active.label}
                </h2>
              </div>
              <p className="text-sm tabular-nums text-glam-muted">
                {active.items.length}{" "}
                {active.items.length === 1 ? "style" : "styles"}
              </p>
            </div>

            <ul className="divide-y divide-glam-border/70 border-y border-glam-border/70">
              {active.items.map((service) => (
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

            {active.category === "braids" ? (
              <p className="mt-5 text-sm text-glam-muted" role="note">
                {BRAND.copy.braidsNotice}
              </p>
            ) : null}
          </m.div>
        ) : null}
      </AnimatePresence>
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
