"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { Reveal } from "@/components/motion/reveal";
import { FilterChipRow } from "@/components/ui/filter-chip-row";
import { cn } from "@/lib/utils/cn";
import {
  GALLERY_CATEGORIES,
  type GalleryCategory,
  type GalleryItem,
} from "@/lib/constants/gallery";

type MasonryGalleryProps = {
  items: GalleryItem[];
  showFilters?: boolean;
};

export function MasonryGallery({ items, showFilters = true }: MasonryGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | "all">("all");
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const filtered =
    activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory);

  const closeModal = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selected, closeModal]);

  return (
    <>
      {showFilters ? (
        <FilterChipRow>
          <FilterButton
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            label="All"
          />
          {(Object.entries(GALLERY_CATEGORIES) as [GalleryCategory, string][]).map(
            ([key, label]) => (
              <FilterButton
                key={key}
                active={activeCategory === key}
                onClick={() => setActiveCategory(key)}
                label={label}
              />
            ),
          )}
        </FilterChipRow>
      ) : null}

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.05} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setSelected(item)}
              className="group relative block w-full overflow-hidden rounded-2xl border border-glam-border/60 bg-glam-secondary shadow-soft transition-all duration-500 hover:border-glam-accent/35 hover:shadow-premium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glam-accent"
              aria-label={`View ${item.alt}`}
            >
              <ParallaxImage
                src={item.src}
                alt={item.alt}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                aspectRatio={`${item.width} / ${item.height}`}
                className="w-full"
                imageClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                yRange={["-5%", "5%"]}
                scaleRange={[1.04, 1.09]}
              />
              <div className="pointer-events-none absolute inset-0 bg-glam-primary/0 transition-colors duration-500 group-hover:bg-glam-primary/15" />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-glam-accent/0 transition-all duration-500 group-hover:ring-glam-accent/30" />
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {selected ? (
          <m.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-glam-primary/95 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label={selected.alt}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
              aria-label="Close gallery"
            >
              ✕
            </button>
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-h-[90vh] max-w-5xl rounded-xl border border-glam-accent/25 p-1 shadow-[var(--shadow-gold)]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selected.src}
                alt={selected.alt}
                width={selected.width}
                height={selected.height}
                className="max-h-[90vh] w-auto rounded-lg object-contain"
                priority
              />
              <p className="mt-4 text-center text-sm tracking-wide text-white/70">{selected.alt}</p>
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 touch-manipulation",
        active
          ? "bg-glam-primary text-glam-secondary"
          : "border border-glam-border bg-glam-secondary text-glam-primary hover:border-glam-accent",
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
