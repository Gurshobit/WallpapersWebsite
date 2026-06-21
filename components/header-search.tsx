"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { resolveMediaUrl } from "@/lib/media";

type MegaResult = {
  wallpapers: {
    id: number;
    uuid: string;
    slug: string | null;
    title: string;
    thumbUrl: string;
    categoryName: string | null;
    downloads: number | null;
  }[];
  categories: { slug: string | null; name: string; totalWallpapers: number }[];
  tags: { slug: string; name: string }[];
  creators: {
    username: string;
    avatarUrl: string | null;
    nickname: string | null;
    totalUploads: number;
  }[];
};

export function HeaderSearch() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MegaResult | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function clearSearch() {
    setQuery("");
    setResults(null);
    setOpen(false);
  }

  function viewAll() {
    if (!query.trim()) return;
    router.push(`${prefix}/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  }

  const hasQuery = !!query.trim();
  const showMenu = open && (hasQuery || loading);

  return (
    <div ref={wrapRef} className="hd-header-search flex-1 max-w-[560px] mx-auto relative">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        className="absolute left-[15px] top-1/2 -translate-y-1/2 pointer-events-none z-[2]"
      >
        <circle cx="11" cy="11" r="7" stroke="var(--dim2)" strokeWidth="2" />
        <path d="m20 20-3-3" stroke="var(--dim2)" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-[11px] py-[11px] pl-[42px] pr-10 text-sm outline-none transition-colors focus:border-[rgba(255,46,99,.5)] relative z-[2]"
        style={{
          background: open ? "var(--surface2)" : "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--text)",
        }}
      />

      {hasQuery && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-[3] flex items-center transition-colors hover:text-[var(--text)]"
          style={{ color: "var(--dim2)" }}
          aria-label={t("clearSearch")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {showMenu && (
        <div
          className="absolute top-[calc(100%+8px)] left-0 right-0 z-[300] rounded-[18px] overflow-hidden"
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--line2)",
            boxShadow: "0 24px 64px rgba(0,0,0,.5)",
            animation: "fadeUp .15s ease both",
          }}
        >
          <div className="px-4 pt-3.5 pb-2.5">
            <div
              className="flex items-center gap-[7px] text-[11px] font-bold tracking-wide uppercase mb-2.5"
              style={{ color: "var(--dim2)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" strokeLinecap="round" />
              </svg>
              {t("wallpapersSection")}{" "}
              {hasQuery && (
                <span style={{ color: "var(--dim3)" }}>· &ldquo;{query.trim()}&rdquo;</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              {loading && (
                <div className="py-6 text-center text-sm" style={{ color: "var(--dim)" }}>
                  {t("loading")}
                </div>
              )}
              {!loading &&
                (results?.wallpapers.length ? (
                  results.wallpapers.map((w) => (
                    <Link
                      key={w.id}
                      href={`${prefix}/wallpapers/${w.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-2.5 py-2 rounded-[10px] transition-colors hover:bg-[var(--surface2)] no-underline"
                    >
                      <div
                        className="w-[52px] h-[30px] rounded-[7px] flex-none bg-cover bg-center"
                        style={{
                          backgroundColor: "var(--surface)",
                          backgroundImage: `url(${resolveMediaUrl(w.thumbUrl)})`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold truncate" style={{ color: "var(--text)" }}>
                          {w.title}
                        </div>
                        <div className="text-[11.5px]" style={{ color: "var(--dim)" }}>
                          {w.categoryName ?? "—"} · {(w.downloads ?? 0).toLocaleString()} downloads
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold px-[7px] py-0.5 rounded-[5px] flex-none"
                        style={{
                          background: "rgba(34,211,238,.14)",
                          color: "#7fe6f5",
                          border: "1px solid rgba(34,211,238,.3)",
                        }}
                      >
                        4K
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm" style={{ color: "var(--dim)" }}>
                    {t("noResults")}
                  </div>
                ))}
            </div>
          </div>

          {results && !loading && (
            <>
              <div className="h-px mx-4" style={{ background: "var(--line)" }} />
              <div className="grid grid-cols-2">
                <div className="px-4 py-3 border-r" style={{ borderColor: "var(--line)" }}>
                  <div
                    className="flex items-center gap-[7px] text-[11px] font-bold tracking-wide uppercase mb-2.5"
                    style={{ color: "var(--dim2)" }}
                  >
                    {t("categories")}
                  </div>
                  <div className="flex flex-col gap-px">
                    {results.categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`${prefix}/category/${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between px-2 py-[7px] rounded-lg text-[13px] font-semibold transition-colors hover:bg-[var(--surface2)] no-underline"
                        style={{ color: "var(--text)" }}
                      >
                        <span>{c.name}</span>
                        <span className="text-[11.5px] font-normal" style={{ color: "var(--dim)" }}>
                          {c.totalWallpapers.toLocaleString()}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div
                    className="flex items-center gap-[7px] text-[11px] font-bold tracking-wide uppercase mb-2.5"
                    style={{ color: "var(--dim2)" }}
                  >
                    {t("tags")}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {results.tags.map((tag) => (
                      <Link
                        key={tag.slug}
                        href={`${prefix}/tag/${tag.slug}`}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center h-[26px] px-2.5 rounded-full text-xs font-semibold transition-colors no-underline hover:border-[rgba(255,46,99,.5)] hover:text-[#ff6a8a]"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--line)",
                          color: "var(--text3)",
                        }}
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {results.creators.length > 0 && (
                <>
                  <div className="h-px mx-4" style={{ background: "var(--line)" }} />
                  <div className="px-4 py-3 pb-3.5">
                    <div
                      className="flex items-center gap-[7px] text-[11px] font-bold tracking-wide uppercase mb-2.5"
                      style={{ color: "var(--dim2)" }}
                    >
                      {t("creators")}
                    </div>
                    <div className="flex gap-2.5">
                      {results.creators.map((cr) => (
                        <Link
                          key={cr.username}
                          href={`${prefix}/u/${cr.username}`}
                          onClick={() => setOpen(false)}
                          className="flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all no-underline hover:border-[rgba(255,46,99,.35)] hover:-translate-y-0.5"
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--line)",
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full bg-cover bg-center border-2"
                            style={{
                              borderColor: "var(--line)",
                              backgroundColor: "var(--surface2)",
                              backgroundImage: cr.avatarUrl
                                ? `url(${resolveMediaUrl(cr.avatarUrl)})`
                                : undefined,
                            }}
                          />
                          <div className="text-center">
                            <div
                              className="text-[12.5px] font-bold truncate max-w-[80px]"
                              style={{ color: "var(--text)" }}
                            >
                              {cr.nickname ?? cr.username}
                            </div>
                            <div className="text-[11px]" style={{ color: "var(--dim)" }}>
                              {cr.totalUploads} uploads
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <div
            className="flex items-center justify-between px-4 py-2.5 border-t"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}
          >
            <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--dim2)" }}>
              <span className="flex items-center gap-1">
                <kbd className="px-[5px] py-0.5 rounded text-[10px] font-mono border" style={{ background: "var(--surface2)", borderColor: "var(--line2)" }}>
                  ↑↓
                </kbd>{" "}
                {t("navigate")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-[5px] py-0.5 rounded text-[10px] font-mono border" style={{ background: "var(--surface2)", borderColor: "var(--line2)" }}>
                  ↵
                </kbd>{" "}
                {t("select")}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-[5px] py-0.5 rounded text-[10px] font-mono border" style={{ background: "var(--surface2)", borderColor: "var(--line2)" }}>
                  Esc
                </kbd>{" "}
                {t("close")}
              </span>
            </div>
            {hasQuery && (
              <button
                type="button"
                onClick={viewAll}
                className="text-[12.5px] font-bold border-none bg-transparent cursor-pointer hover:underline"
                style={{ color: "#ff6a8a" }}
              >
                {t("viewAllResults")} →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
