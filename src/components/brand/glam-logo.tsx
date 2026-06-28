import Image from "next/image";
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
  priority = false,
}: GlamLogoProps) {
  const onDark = variant === "onDark";
  const isCompact = variant === "compact";

  const logoSrc = isCompact
    ? BRAND.logo.mark
    : onDark
      ? BRAND.logo.heroBright
      : BRAND.logo.navWordmark;
  const logoWidth = isCompact ? 150 : BRAND.logo.navWordmarkWidth;
  const logoHeight = isCompact ? 150 : BRAND.logo.navWordmarkHeight;

  const content = (
    <Image
      src={logoSrc}
      alt={BRAND.logo.alt}
      width={logoWidth}
      height={logoHeight}
      priority={priority}
      unoptimized
      className={cn(
        "block shrink-0 object-contain",
        isCompact
          ? "h-12 w-12"
          : onDark
            ? "h-10 w-auto brightness-125 contrast-110 sm:h-11"
            : "h-8 w-auto sm:h-9",
        className,
      )}
    />
  );

  if (!asLink) return content;

  return (
    <Link href="/" className="group inline-flex shrink-0 items-center" aria-label={`${BRAND.fullName} home`}>
      {content}
    </Link>
  );
}
