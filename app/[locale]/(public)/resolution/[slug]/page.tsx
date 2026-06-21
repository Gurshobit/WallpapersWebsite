import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { BrowseLayout } from "@/components/browse-layout";
import {
  listWallpapers,
  getBrowseSidebar,
} from "@/lib/db/queries/wallpapers";
import { db } from "@/lib/db";
import { resolutions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [res] = await db.select().from(resolutions).where(eq(resolutions.slug, slug)).limit(1);
  return buildMetadata({
    title: res?.metaTitle ?? `${res?.name ?? slug} Wallpapers`,
    description: res?.metaDescription ?? `Download wallpapers in ${res?.name} resolution.`,
    path: `/resolution/${slug}`,
    locale: locale as "en",
  });
}

export default async function ResolutionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const page = parseInt(sp.page ?? "1", 10);
  const sort = (sp.sort as "latest" | "popular" | "downloads") ?? "latest";
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [res, sidebar, result] = await Promise.all([
    db.select().from(resolutions).where(eq(resolutions.slug, slug)).limit(1).then((r) => r[0]),
    getBrowseSidebar(),
    listWallpapers({ resolutionSlug: slug, page, sort }),
  ]);

  return (
    <BrowseLayout
      title={`${res?.name ?? slug} Wallpapers`}
      subtitle={`${result.total.toLocaleString()} wallpapers`}
      sort={sort}
      basePath={`${prefix}/resolution/${slug}`}
      items={result.items}
      page={result.page}
      totalPages={result.totalPages}
      totalItems={result.total}
      searchParams={{ sort }}
      sidebar={{ ...sidebar, activeResolution: slug }}
    />
  );
}
