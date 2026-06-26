"use client";

import { m, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

type ParallaxImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  aspectRatio?: string;
  yRange?: [string, string];
  scaleRange?: [number, number];
};

export function ParallaxImage({
  src,
  alt,
  sizes = "100vw",
  className,
  imageClassName,
  aspectRatio,
  yRange = ["-6%", "6%"],
  scaleRange = [1.06, 1.12],
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <m.div className="absolute inset-0 origin-center" style={{ y, scale }}>
        <Image src={src} alt={alt} fill sizes={sizes} className={cn("object-cover", imageClassName)} />
      </m.div>
    </div>
  );
}
