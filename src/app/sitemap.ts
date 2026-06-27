import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants/brand";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://glam-room-gilt.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/book",
    "/services",
    "/gallery",
    "/about",
    "/experts",
    "/testimonials",
    "/faq",
    "/contact",
  ];

  const now = new Date();

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/book" ? 0.9 : 0.7,
  }));
}
