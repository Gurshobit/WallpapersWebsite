import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { BrowseLayout } from "@/components/browse-layout";
import {
  listWallpapers,
  getBrowseSidebar,
} from "@/lib/db/queries/wallpapers";
import type { SortTab } from "@/components/sort-tabs";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  const { db } = await import("@/lib/db");
  const { categories } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const [cat] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return cat ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const cat = await getCategory(slug);
  return buildMetadata({
    title: cat?.metaTitle ?? `${cat?.name ?? slug} Wallpapers`,
    description:
      cat?.metaDescription ??
      cat?.pageDescription ??
      `Browse ${cat?.name} wallpapers in HD and 4K.`,
    path: `/category/${slug}`,
    locale: locale as "en",
  });
}

export default async function CategoryPage({
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
  const sort = (sp.sort as SortTab) ?? "latest";
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [cat, sidebar, result] = await Promise.all([
    getCategory(slug),
    getBrowseSidebar(),
    listWallpapers({ categorySlug: slug, page, sort }),
  ]);

  return (
    <BrowseLayout
      title={`${cat?.name ?? slug} Wallpapers`}
      subtitle={`${result.total.toLocaleString()} wallpapers`}
      sort={sort}
      basePath={`${prefix}/category/${slug}`}
      items={result.items}
      page={result.page}
      totalPages={result.totalPages}
      totalItems={result.total}
      searchParams={{ sort }}
      sidebar={{ ...sidebar, activeCategory: slug }}
    />
  );
}
