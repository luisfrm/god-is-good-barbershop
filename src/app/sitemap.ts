import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/seo";

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return buildSitemapEntries(base, new Date().toISOString());
}
