import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { BrowseLayout } from "@/components/browse-layout";
import {
  listWallpapers,
  getBrowseSidebar,
} from "@/lib/db/queries/wallpapers";
import type { SortTab } from "@/components/sort-tabs";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return buildMetadata({
    title: `${slug.replace(/-/g, " ")} Wallpapers`,
    description: `Wallpapers tagged with ${slug.replace(/-/g, " ")}.`,
    path: `/tag/${slug}`,
    locale: locale as "en",
  });
}

export default async function TagPage({
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
  const tagLabel = slug.replace(/-/g, " ");

  const [sidebar, result] = await Promise.all([
    getBrowseSidebar(),
    listWallpapers({ tagSlug: slug, page, sort }),
  ]);

  return (
    <BrowseLayout
      title={`#${tagLabel}`}
      subtitle={`${result.total.toLocaleString()} wallpapers`}
      sort={sort}
      basePath={`${prefix}/tag/${slug}`}
      items={result.items}
      page={result.page}
      totalPages={result.totalPages}
      totalItems={result.total}
      searchParams={{ sort }}
      sidebar={sidebar}
    />
  );
}
