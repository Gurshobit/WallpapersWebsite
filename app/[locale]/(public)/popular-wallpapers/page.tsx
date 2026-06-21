import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { BrowseLayout } from "@/components/browse-layout";
import {
  listWallpapers,
  getBrowseSidebar,
} from "@/lib/db/queries/wallpapers";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata({
    title: "Popular HD Wallpapers",
    description: "Most popular HD wallpapers on HDWallpapers.site.",
    path: "/popular-wallpapers",
    locale: locale as "en",
  });
}

export default async function PopularPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const page = parseInt(sp.page ?? "1", 10);
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [sidebar, result] = await Promise.all([
    getBrowseSidebar(),
    listWallpapers({ sort: "popular", page }),
  ]);

  return (
    <BrowseLayout
      title="Popular Wallpapers"
      subtitle={`${result.total.toLocaleString()} wallpapers`}
      sort="popular"
      showSortTabs={false}
      basePath={`${prefix}/popular-wallpapers`}
      items={result.items}
      page={result.page}
      totalPages={result.totalPages}
      totalItems={result.total}
      sidebar={sidebar}
    />
  );
}
