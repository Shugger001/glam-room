"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { isSalonOpen, salonHoursLabel, salonStatusMessage } from "@/lib/salon/hours";

type SalonOpenStatusProps = {
  variant?: "stat" | "badge";
  className?: string;
};

export function SalonOpenStatus({ variant = "stat", className }: SalonOpenStatusProps) {
  const [open, setOpen] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function sync() {
      setOpen(isSalonOpen());
      setMessage(salonStatusMessage());
    }
    sync();
    const id = window.setInterval(sync, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (open === null) {
    if (variant === "stat") {
      return (
        <div className={cn("text-center", className)}>
          <p className="heading-display text-balance text-2xl text-glam-accent sm:text-4xl lg:text-5xl">{salonHoursLabel()}</p>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
            Mon–Sun
          </p>
        </div>
      );
    }
    return null;
  }

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
          open ? "bg-emerald-500/15 text-emerald-700" : "bg-glam-primary/10 text-glam-muted",
          className,
        )}
      >
        <span
          className={cn("h-2 w-2 rounded-full", open ? "animate-pulse bg-emerald-500" : "bg-glam-muted/60")}
          aria-hidden
        />
        {message}
      </span>
    );
  }

  return (
    <div className={cn("text-center", className)}>
      <p className="heading-display text-balance text-2xl text-glam-accent sm:text-4xl lg:text-5xl">{message}</p>
      <p className="mt-2 text-sm font-medium uppercase tracking-wider text-glam-muted">
        {open ? "Walk-ins welcome · Mon–Sun" : salonHoursLabel()}
      </p>
    </div>
  );
}
