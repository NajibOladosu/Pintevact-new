import type { MetadataRoute } from "next";
import { catalog } from "@/content/catalog";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const pages = ["", "/courses", "/pricing", "/discover", "/about", "/contact", "/terms", "/privacy", "/signin", "/signup"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...catalog.map((c) => ({ url: `${base}/courses/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
