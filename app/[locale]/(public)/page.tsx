import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { HeroCarousel } from "@/components/hero-carousel";
import { SidebarFilters } from "@/components/sidebar-filters";
import { MobileFilterDrawer } from "@/components/mobile-filter-drawer";
import { WallpaperGrid } from "@/components/wallpaper-card";
import { SortTabs, type SortTab } from "@/components/sort-tabs";
import { Pagination } from "@/components/pagination";
import { AdSlot } from "@/components/ad-slot";
import {
  listWallpapers,
  getFeaturedWallpapers,
  getSidebarCategories,
  getSidebarResolutions,
  getSidebarResolutionGroups,
  getPopularColors,
  countWallpapers,
} from "@/lib/db/queries/wallpapers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildMetadata({
    title: "Free HD Wallpapers — Desktop & Mobile",
    description:
      "Browse and download stunning HD wallpapers for desktop, mobile and tablet.",
    path: "/",
    locale: locale as "en",
  });
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const sort = (sp.sort as SortTab) ?? "latest";
  const page = parseInt(sp.page ?? "1", 10);
  const t = await getTranslations("home");

  const [featured, categories, resolutions, resolutionGroups, colors, result, totalCount] =
    await Promise.all([
      getFeaturedWallpapers(5),
      getSidebarCategories(),
      getSidebarResolutions(),
      getSidebarResolutionGroups(),
      getPopularColors(),
      listWallpapers({ sort, page }),
      countWallpapers(),
    ]);

  const prefix = locale === "en" ? "" : `/${locale}`;

  const sidebarProps = { categories, resolutions, resolutionGroups, colors };

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      {featured.length > 0 && (
        <HeroCarousel
          wallpapers={featured}
          prefix={prefix}
          labels={{ featured: t("featured"), download4k: t("download4k"), preview: t("preview") }}
        />
      )}

      <div className="hd-main-grid max-w-[1320px] mx-auto px-4 sm:px-7 py-5 sm:py-7 flex gap-7 items-start">
        {/* Desktop sidebar */}
        <SidebarFilters {...sidebarProps} />

        {/* Mobile filter sheet — trigger fires from header; this just mounts the sheet */}
        <MobileFilterDrawer {...sidebarProps} />

        <div className="flex-1 min-w-0">
          <div className="hd-grid-header flex items-center justify-between mb-[18px] gap-3 flex-wrap">
            <div>
              <h2 className="font-bold text-[20px] sm:text-[22px] tracking-[-0.4px]"
                style={{ fontFamily: "var(--font-heading)" }}>
                Explore wallpapers
              </h2>
              <div className="text-[13px] mt-0.5" style={{ color: "var(--dim)" }}>
                {totalCount.toLocaleString()} wallpapers
              </div>
            </div>
            <Suspense fallback={null}>
              <SortTabs active={sort} basePath={`${prefix}/`} />
            </Suspense>
          </div>

          <AdSlot slug="header_728x90" className="mb-[22px] w-full" />
          <WallpaperGrid items={result.items} />
          <AdSlot slug="header_728x90" className="mt-[22px] w-full" />

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            basePath={`${prefix}/`}
            searchParams={{ sort }}
          />
        </div>
      </div>
    </div>
  );
}
