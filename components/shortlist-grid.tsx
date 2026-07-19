"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { resolveMediaUrl } from "@/lib/media";
import { wallpaperDownloadPath } from "@/lib/wallpaper-urls";

type ShortlistItem = {
  id: number;
  uuid: string;
  slug: string | null;
  title: string;
  thumbUrl: string;
  categoryName: string | null;
  username: string | null;
  avatarUrl: string | null;
  authorName: string | null;
  downloads: number | null;
};

export function ShortlistGrid({ items }: { items: ShortlistItem[] }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const prefix = locale === "en" ? "" : `/${locale}`;

  async function remove(id: number) {
    await fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallpaperId: id }),
    });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-[100px] px-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(245,197,24,.12)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4Z"
              stroke="#f5c518"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2
          className="font-bold text-xl mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {t("shortlistEmpty")}
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--dim)" }}>
          {t("shortlistEmptyHint")}
        </p>
        <Link
          href={prefix || "/"}
          className="inline-block rounded-xl px-6 py-3 font-bold text-[15px] text-white no-underline"
          style={{
            background: "linear-gradient(135deg, #ff2e63, #ff6a3d)",
            boxShadow: "0 4px 16px rgba(255,46,99,.3)",
          }}
        >
          {t("browseWallpapers")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(252px,1fr))] gap-3 sm:gap-[18px]">
      {items.map((w) => {
        const author = w.authorName ?? w.username ?? "Unknown";
        const detailHref = `${prefix}/wallpapers/${w.slug}`;
        return (
          <div
            key={w.id}
            className="rounded-[15px] overflow-hidden transition-transform hover:-translate-y-1"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <div className="relative aspect-video">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundColor: "var(--surface2)",
                  backgroundImage: `url(${resolveMediaUrl(w.thumbUrl)})`,
                }}
              />
              {w.categoryName && (
                <span
                  className="absolute top-2.5 left-2.5 text-[11px] font-semibold px-[9px] py-1 rounded-[7px] text-white"
                  style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)" }}
                >
                  {w.categoryName}
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(w.id)}
                title={t("removeFromShortlist")}
                className="absolute top-2.5 right-2.5 w-[30px] h-[30px] flex items-center justify-center rounded-lg border-none cursor-pointer"
                style={{ background: "rgba(0,0,0,.5)", color: "#f5c518" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4Z" />
                </svg>
              </button>
            </div>
            <div className="px-[13px] py-[11px] pb-[13px]">
              <Link
                href={detailHref}
                className="block font-bold text-sm truncate mb-2 no-underline hover:underline"
                style={{ color: "var(--text)" }}
              >
                {w.title}
              </Link>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-[7px] min-w-0">
                  <span
                    className="w-5 h-5 rounded-full flex-none bg-cover bg-center"
                    style={{
                      backgroundColor: "var(--surface2)",
                      backgroundImage: w.avatarUrl
                        ? `url(${resolveMediaUrl(w.avatarUrl)})`
                        : undefined,
                    }}
                  />
                  <span className="text-xs truncate" style={{ color: "var(--muted)" }}>
                    {author}
                  </span>
                </span>
                <a
                  href={wallpaperDownloadPath(w.uuid)}
                  className="flex items-center gap-[5px] rounded-[7px] px-[11px] py-1.5 text-xs font-bold text-white no-underline flex-none"
                  style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3v12m0 0 4-4m-4 4-4-4"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  4K
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
