"use client";

import { AnimatePresence, m } from "framer-motion";
import { useMemo, useState } from "react";
import { ServiceCard } from "@/components/services/service-card";
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
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setActive(option.id)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all duration-300",
              active === option.id
                ? "bg-glam-primary text-glam-secondary shadow-soft"
                : "border border-glam-border bg-glam-secondary text-glam-primary hover:border-glam-accent",
            )}
            aria-pressed={active === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>

      <m.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((service, i) => (
            <m.div
              key={service.id}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: i * 0.03 }}
            >
              <ServiceCard service={service} index={0} disableReveal />
            </m.div>
          ))}
        </AnimatePresence>
      </m.div>
    </>
  );
}
