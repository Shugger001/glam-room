import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "accent";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-glam-primary text-glam-secondary shadow-soft hover:bg-glam-primary/90 hover:shadow-premium active:scale-[0.98]",
  secondary:
    "bg-glam-secondary text-glam-primary border border-glam-border shadow-sm hover:border-glam-accent/30 hover:bg-glam-background",
  outline:
    "border border-glam-primary/20 bg-transparent text-glam-primary hover:border-glam-accent hover:text-glam-accent hover:shadow-[var(--shadow-gold)]",
  ghost: "bg-transparent text-glam-primary hover:bg-glam-primary/5",
  accent:
    "gradient-accent text-glam-primary shadow-[var(--shadow-gold)] hover:-translate-y-0.5 hover:shadow-[0_28px_56px_-18px_rgba(200,168,107,0.45)] active:translate-y-0 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.06em] transition-all duration-300 ease-out",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.06em] transition-all duration-300 ease-out",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
