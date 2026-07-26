import type { MetadataRoute } from "next";
import { getSalonServiceSlugs } from "@/lib/data/live-services";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://glam-room-gilt.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    "/track",
  ];

  const now = new Date();
  const serviceSlugs = await getSalonServiceSlugs();

  return [
    ...routes.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: (path === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: path === "" ? 1 : path === "/book" ? 0.9 : 0.7,
    })),
    ...serviceSlugs.map((slug) => ({
      url: `${baseUrl}/services/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
