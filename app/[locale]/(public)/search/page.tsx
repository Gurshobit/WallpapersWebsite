import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { BrowseLayout } from "@/components/browse-layout";
import { listWallpapers, getBrowseSidebar } from "@/lib/db/queries/wallpapers";
import { parsePageSize } from "@/lib/routing";
import type { SortTab } from "@/components/sort-tabs.types";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  return buildMetadata({
    title: q ? `Search: ${q} — HDWallpapers.site` : "Search — HDWallpapers.site",
    description: "Search wallpapers, tags, and creators.",
    path: "/search",
    locale: locale as "en",
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; sort?: string; page?: string; size?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const q = sp.q?.trim() ?? "";
  const sort = (sp.sort as SortTab) ?? "latest";
  const page = parseInt(sp.page ?? "1", 10);
  const pageSize = parsePageSize(sp.size);
  const prefix = locale === "en" ? "" : `/${locale}`;
  const t = await getTranslations("common");

  const [sidebar, result] = await Promise.all([
    getBrowseSidebar(),
    q
      ? listWallpapers({ q, sort, page, pageSize })
      : Promise.resolve({ items: [], total: 0, page: 1, pageSize, totalPages: 0 }),
  ]);

  return (
    <BrowseLayout
      title={q ? t("resultsFor", { query: q }) : t("search")}
      subtitle={q ? `${result.total.toLocaleString()} wallpapers` : t("searchPlaceholder")}
      sort={sort}
      basePath={`${prefix}/search`}
      items={result.items}
      page={result.page}
      totalPages={result.totalPages}
      totalItems={result.total}
      pageSize={pageSize}
      searchParams={{ sort, q, size: String(pageSize) }}
      searchQuery={q}
      sidebar={sidebar}
    />
  );
}
