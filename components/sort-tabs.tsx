"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { SortTab } from "./sort-tabs.types";

export type { SortTab } from "./sort-tabs.types";

interface SortTabsProps {
  active: SortTab;
  basePath?: string;
}

const SORT_ICONS: Record<SortTab, string> = {
  popular: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  latest: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 10.4l-3.5 3.5-1.4-1.4 2.9-2.9V6h2v6.4z",
  downloads: "M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
};

export function SortTabs({ active, basePath = "" }: SortTabsProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const sorts: { key: SortTab; label: string }[] = [
    { key: "popular", label: t("trending") },
    { key: "latest", label: t("newest") },
    { key: "downloads", label: t("mostDownloaded") },
  ];

  return (
    <div
      className="flex gap-1 p-1 rounded-[11px]"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      {sorts.map(({ key, label }) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", key);
        const href = `${basePath || pathname}?${params.toString()}`;
        const isActive = active === key;

        return (
          <Link
            key={key}
            href={href.startsWith(prefix) ? href : `${prefix}${href}`}
            className={`hd-sort-tab inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors no-underline ${isActive ? "hd-sort-active" : ""}`}
            style={
              isActive
                ? {
                    background: "rgba(255,46,99,.12)",
                    color: "#ff2e63",
                    fontWeight: 700,
                  }
                : { color: "var(--muted)" }
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={SORT_ICONS[key]} />
            </svg>
            <span className="hd-sort-lbl">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
