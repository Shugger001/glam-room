"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory === "all" ? items : items.filter((i) => i.category === activeCategory),
    [activeCategory, items],
  );

  const selected = selectedIndex == null ? null : filtered[selectedIndex] ?? null;

  const closeModal = useCallback(() => setSelectedIndex(null), []);
  const showPrev = useCallback(() => {
    setSelectedIndex((i) => {
      if (i == null || filtered.length === 0) return i;
      return (i - 1 + filtered.length) % filtered.length;
    });
  }, [filtered.length]);
  const showNext = useCallback(() => {
    setSelectedIndex((i) => {
      if (i == null || filtered.length === 0) return i;
      return (i + 1) % filtered.length;
    });
  }, [filtered.length]);

  useEffect(() => {
    if (selectedIndex == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedIndex, closeModal, showPrev, showNext]);

  useEffect(() => {
    setSelectedIndex(null);
  }, [activeCategory]);

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

      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:gap-4">
        {filtered.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedIndex(i)}
            className="group relative aspect-[3/4] w-full overflow-hidden bg-glam-primary text-left transition duration-300 ease-out touch-manipulation active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glam-accent"
            aria-label={`Open ${item.alt}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="33vw"
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
            />
            <div className="pointer-events-none absolute inset-0 bg-glam-primary/0 transition duration-300 group-hover:bg-glam-primary/20" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-glam-primary/70 to-transparent p-2 text-[0.65rem] text-white opacity-0 transition duration-300 group-hover:opacity-100 sm:block sm:p-3 sm:text-sm">
              View
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-glam-muted">No looks in this category yet.</p>
      ) : null}

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
              className="absolute right-5 top-5 z-10 flex min-h-11 min-w-11 items-center justify-center border border-white/20 text-white transition hover:bg-white/10"
              aria-label="Close gallery"
            >
              ✕
            </button>
            {filtered.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  className="absolute left-3 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center border border-white/20 text-white transition hover:bg-white/10 sm:left-6"
                  aria-label="Previous look"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  className="absolute right-3 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center border border-white/20 text-white transition hover:bg-white/10 sm:right-6"
                  aria-label="Next look"
                >
                  →
                </button>
              </>
            ) : null}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[90vh] max-w-5xl border border-glam-accent/25 p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selected.src}
                alt={selected.alt}
                width={selected.width}
                height={selected.height}
                className="max-h-[80vh] w-auto object-contain"
                priority
              />
              <div className="mt-4 flex flex-col items-center gap-3 px-4 pb-3 text-center sm:flex-row sm:justify-between sm:text-left">
                <p className="text-sm tracking-wide text-white/70">{selected.alt}</p>
                <Link
                  href="/book"
                  className="inline-flex min-h-11 items-center justify-center bg-glam-accent px-5 text-xs font-semibold tracking-wide text-glam-primary transition hover:brightness-105"
                >
                  Book this look
                </Link>
              </div>
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
        "shrink-0 border px-5 py-2.5 text-sm font-medium transition duration-200 touch-manipulation active:scale-[0.98]",
        active
          ? "border-glam-primary bg-glam-primary text-glam-secondary"
          : "border-glam-border bg-glam-secondary text-glam-primary hover:border-glam-accent",
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
