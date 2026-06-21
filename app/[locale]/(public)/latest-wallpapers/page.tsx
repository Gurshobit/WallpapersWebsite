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
    title: "Latest HD Wallpapers",
    description: "Browse the newest HD wallpapers added to HDWallpapers.site.",
    path: "/latest-wallpapers",
    locale: locale as "en",
  });
}

export default async function LatestPage({
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
    listWallpapers({ sort: "latest", page }),
  ]);

  return (
    <BrowseLayout
      title="Latest Wallpapers"
      subtitle={`${result.total.toLocaleString()} wallpapers`}
      sort="latest"
      showSortTabs={false}
      basePath={`${prefix}/latest-wallpapers`}
      items={result.items}
      page={result.page}
      totalPages={result.totalPages}
      totalItems={result.total}
      sidebar={sidebar}
    />
  );
}
