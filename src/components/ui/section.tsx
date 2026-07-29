import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: "default" | "white" | "dark" | "accent" | "warm";
  narrow?: boolean;
};

const bgStyles = {
  default: "bg-glam-background",
  white: "bg-glam-secondary",
  dark: "bg-glam-primary text-glam-secondary",
  accent: "bg-glam-accent/8",
  warm: "bg-glam-background-warm",
};

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
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

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <Reveal className={cn(align === "center" && "text-center", "mb-10 sm:mb-14", className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 font-[family-name:var(--font-cormorant)] text-base italic text-glam-muted sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl">{title}</h2>
      {description ? (
        <p
          className={cn(
            "mt-4 max-w-xl text-base leading-relaxed text-glam-muted sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
