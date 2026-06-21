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
  params: Promise<{ locale: string; name: string }>;
}) {
  const { locale, name } = await params;
  const color = `#${name}`;
  return buildMetadata({
    title: `${color} Wallpapers`,
    description: `Browse wallpapers with dominant color ${color}.`,
    path: `/color/${name}`,
    locale: locale as "en",
  });
}

export default async function ColorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; name: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { locale, name } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const color = `#${name}`;
  const page = parseInt(sp.page ?? "1", 10);
  const sort = (sp.sort as SortTab) ?? "latest";
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [sidebar, result] = await Promise.all([
    getBrowseSidebar(),
    listWallpapers({ color, page, sort }),
  ]);

  return (
    <BrowseLayout
      title={`${color} Wallpapers`}
      subtitle={`${result.total.toLocaleString()} wallpapers`}
      sort={sort}
      basePath={`${prefix}/color/${name}`}
      items={result.items}
      page={result.page}
      totalPages={result.totalPages}
      totalItems={result.total}
      searchParams={{ sort }}
      sidebar={{ ...sidebar, activeColor: name }}
      headerExtra={
        <div
          className="w-8 h-8 rounded-full border-2 flex-none"
          style={{ background: color, borderColor: "var(--line2)" }}
        />
      }
    />
  );
}
