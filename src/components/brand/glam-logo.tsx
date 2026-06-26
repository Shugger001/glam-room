import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { BRAND } from "@/lib/constants/brand";

type GlamLogoProps = {
  variant?: "default" | "onDark" | "compact";
  className?: string;
  priority?: boolean;
  asLink?: boolean;
};

export function GlamLogo({
  variant = "default",
  className,
  asLink = true,
  priority: _priority,
}: GlamLogoProps) {
  const content = (
    <span
      className={cn(
        "inline-flex flex-col leading-none",
        variant === "compact" && "gap-0",
        variant !== "compact" && "gap-0.5",
        className,
      )}
      aria-label={BRAND.fullName}
    >
      <span
        className={cn(
          "heading-display text-xl font-medium tracking-[0.12em] uppercase sm:text-2xl",
          variant === "onDark" ? "text-glam-secondary" : "text-glam-primary",
        )}
      >
        The Glam
      </span>
      <span
        className={cn(
          "text-[0.65rem] font-medium uppercase tracking-[0.35em] sm:text-xs",
          variant === "onDark" ? "text-glam-accent" : "text-glam-accent",
        )}
      >
        Room
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" className="group inline-flex shrink-0 items-center" aria-label={`${BRAND.fullName} — Home`}>
      {content}
    </Link>
  );
}
