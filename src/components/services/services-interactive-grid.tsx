"use client";

import { AnimatePresence, m } from "framer-motion";
import { useMemo, useState } from "react";
import { ServiceCard } from "@/components/services/service-card";
import { FilterChipRow } from "@/components/ui/filter-chip-row";
import {
  SERVICE_CATEGORIES,
  type SalonService,
  type ServiceCategory,
} from "@/lib/constants/services";
import { cn } from "@/lib/utils/cn";

type ServicesInteractiveGridProps = {
  services: SalonService[];
};

const FILTER_OPTIONS: Array<{ id: "all" | ServiceCategory; label: string }> = [
  { id: "all", label: "All" },
  ...(
    Object.entries(SERVICE_CATEGORIES) as Array<[ServiceCategory, string]>
  ).map(([id, label]) => ({ id, label })),
];

export function ServicesInteractiveGrid({ services }: ServicesInteractiveGridProps) {
  const [active, setActive] = useState<"all" | ServiceCategory>("all");

  const filtered = useMemo(
    () => (active === "all" ? services : services.filter((s) => s.category === active)),
    [active, services],
  );

  return (
    <>
      <FilterChipRow>
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setActive(option.id)}
            className={cn(
              "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 touch-manipulation",
              active === option.id
                ? "bg-glam-primary text-glam-secondary shadow-soft"
                : "border border-glam-border bg-glam-secondary text-glam-primary hover:border-glam-accent",
            )}
            aria-pressed={active === option.id}
          >
            {option.label}
          </button>
        ))}
      </FilterChipRow>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((service) => (
            <m.div
              key={service.id}
              layout="position"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <ServiceCard service={service} disableReveal />
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-center text-sm text-glam-muted">No services in this category yet.</p>
      ) : null}
    </>
  );
}
