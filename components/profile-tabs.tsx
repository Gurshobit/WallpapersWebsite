"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const TABS = ["uploads", "collections", "liked"] as const;
export type ProfileTab = (typeof TABS)[number];

const TAB_ICONS: Record<ProfileTab, string> = {
  uploads:
    "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
  collections: "M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4z",
  liked:
    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
};

interface ProfileTabsProps {
  handle: string;
  active: ProfileTab;
}

export function ProfileTabs({ handle, active }: ProfileTabsProps) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const labels: Record<ProfileTab, string> = {
    uploads: t("uploads"),
    collections: t("collections"),
    liked: t("liked"),
  };

  return (
    <div
      className="flex gap-0.5 mx-2 mb-[22px] mt-[26px] border-b"
      style={{ borderColor: "var(--line)" }}
    >
      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <Link
            key={tab}
            href={`${prefix}/u/${handle}?tab=${tab}`}
            className="inline-flex items-center gap-[7px] px-4 py-[11px] text-sm transition-colors no-underline"
            style={
              isActive
                ? {
                    fontWeight: 700,
                    color: "#ff2e63",
                    borderBottom: "2px solid #ff2e63",
                    marginBottom: -1,
                  }
                : { fontWeight: 500, color: "var(--muted)" }
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={TAB_ICONS[tab]} />
            </svg>
            {labels[tab]}
          </Link>
        );
      })}
    </div>
  );
}
