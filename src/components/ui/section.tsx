import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: "default" | "white" | "dark" | "accent";
  narrow?: boolean;
};

const bgStyles = {
  default: "bg-glam-background",
  white: "bg-glam-secondary",
  dark: "bg-glam-primary text-glam-secondary",
  accent: "bg-glam-accent/10",
};

export function Section({
  children,
  className,
  id,
  background = "default",
  narrow = true,
}: SectionProps) {
  return (
    <section id={id} className={cn("section-padding", bgStyles[background], className)}>
      <div className={cn(narrow ? "container-narrow" : "container-wide")}>{children}</div>
    </section>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <Reveal className={cn(align === "center" && "text-center", "mb-12 sm:mb-16", className)}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-glam-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="heading-display text-4xl text-balance sm:text-5xl lg:text-6xl">{title}</h2>
      {description ? (
        <p
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed text-glam-muted sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
