import { Suspense, type ReactNode } from "react";
import { SidebarFilters } from "@/components/sidebar-filters";
import { MobileFilterDrawer } from "@/components/mobile-filter-drawer";
import { WallpaperGrid } from "@/components/wallpaper-card";
import { SortTabs, type SortTab } from "@/components/sort-tabs";
import { Pagination } from "@/components/pagination";
import { AdSlot } from "@/components/ad-slot";
import { PAGE_SIZE } from "@/lib/routing";

interface BrowseSidebarData {
  categories: {
    id: number;
    slug: string | null;
    name: string;
    totalWallpapers: number;
  }[];
  resolutions: {
    id: number;
    slug: string | null;
    name: string;
    width: number | null;
    height: number | null;
  }[];
  resolutionGroups?: {
    id: number;
    name: string;
    resolutions: {
      id: number;
      name: string;
      slug: string | null;
      width: number | null;
      height: number | null;
    }[];
  }[];
  colors: string[];
  activeCategory?: string;
  activeResolution?: string;
  activeColor?: string;
}

interface BrowseLayoutProps {
  title: string;
  subtitle?: string;
  sort?: SortTab;
  showSortTabs?: boolean;
  basePath: string;
  items: Parameters<typeof WallpaperGrid>[0]["items"];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  searchParams?: Record<string, string>;
  searchQuery?: string;
  sidebar: BrowseSidebarData;
  headerExtra?: ReactNode;
}

export function BrowseLayout({
  title,
  subtitle,
  sort = "latest",
  showSortTabs = true,
  basePath,
  items,
  page,
  totalPages,
  totalItems,
  pageSize = PAGE_SIZE,
  searchParams,
  searchQuery,
  sidebar,
  headerExtra,
}: BrowseLayoutProps) {
  const sidebarProps = {
    categories: sidebar.categories,
    resolutions: sidebar.resolutions,
    resolutionGroups: sidebar.resolutionGroups,
    colors: sidebar.colors,
    activeCategory: sidebar.activeCategory,
    activeResolution: sidebar.activeResolution,
    activeColor: sidebar.activeColor,
  };

  return (
    <div
      className="hd-main-grid max-w-[1320px] mx-auto px-4 sm:px-7 py-5 sm:py-7 flex gap-7 items-start"
      style={{ animation: "fadeUp .4s ease both" }}
    >
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <SidebarFilters {...sidebarProps} />

      {/* Mobile filter sheet — trigger lives in the header, this just mounts the sheet */}
      <MobileFilterDrawer {...sidebarProps} />

      <div className="flex-1 min-w-0">
        {/* Grid header: title + sort tabs */}
        <div className="hd-grid-header flex items-center justify-between mb-[18px] gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            {headerExtra}
            <div className="min-w-0">
              <h1
                className="font-bold text-[20px] sm:text-[22px] tracking-[-0.4px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {title}
              </h1>
              {subtitle && (
                <div className="text-[13px] mt-0.5" style={{ color: "var(--dim)" }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {showSortTabs && (
            <Suspense fallback={null}>
              <SortTabs active={sort} basePath={basePath} />
            </Suspense>
          )}
        </div>

        <AdSlot slug="header_728x90" className="mb-[22px] w-full" />

        <WallpaperGrid items={items} searchQuery={searchQuery} clearSearchHref={searchQuery ? basePath : undefined} />

        <AdSlot slug="header_728x90" className="mt-[22px] w-full" />

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          basePath={basePath}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
