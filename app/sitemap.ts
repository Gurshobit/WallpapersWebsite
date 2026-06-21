import type { MetadataRoute } from "next";
import { getAllActiveSlugs } from "@/lib/db/queries/wallpapers";
import { LOCALES, SITE_URL } from "@/lib/routing";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/latest-wallpapers",
    "/popular-wallpapers",
    "/top-downloaded-wallpapers",
    "/contact",
  ];

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    staticPages.map((path) => ({
      url: `${SITE_URL}${locale === "en" ? path || "/" : `/${locale}${path}`}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.9,
    }))
  );

  let wallpaperEntries: MetadataRoute.Sitemap = [];
  try {
    const walls = await getAllActiveSlugs();
    wallpaperEntries = walls.flatMap((w) =>
      LOCALES.map((locale) => ({
        url: `${SITE_URL}${locale === "en" ? "" : `/${locale}`}/wallpapers/${w.slug}`,
        lastModified: w.dateAdded ?? new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }))
    );
  } catch {
    // DB not available during build
  }

  return [...staticEntries, ...wallpaperEntries];
}
