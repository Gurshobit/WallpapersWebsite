"use client";

import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { formatCount } from "@/lib/format";
import { wallpaperDownloadPath } from "@/lib/wallpaper-urls";

// ── types ─────────────────────────────────────────────────────────────────────

interface WallpaperItem {
  id: number;
  uuid: string;
  slug: string | null;
  title: string;
  thumbUrl: string;
  width?: number | null;
  height?: number | null;
  categoryName?: string | null;
  authorName?: string | null;
  username?: string | null;
  downloads?: number | null;
}

interface WallpaperCardProps {
  wallpaper: WallpaperItem;
}

// ── format options ────────────────────────────────────────────────────────────

type Format = "jpeg" | "jpg" | "webp" | "avif";

const FORMATS: { id: Format; label: string; note?: string }[] = [
  { id: "jpeg", label: "JPEG", note: "default" },
  { id: "jpg",  label: "JPG" },
  { id: "webp", label: "WebP" },
  { id: "avif", label: "AVIF" },
];

// ── icons ─────────────────────────────────────────────────────────────────────

function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#ff2e63" : "none"}>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
        stroke={filled ? "#ff2e63" : "currentColor"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconThumbDown({ filled }: { filled?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "rgba(255,255,255,.35)" : "none"}>
      <path
        d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 18h18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconBookmark({ filled }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#fbbf24" : "none"}>
      <path
        d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4Z"
        stroke={filled ? "#fbbf24" : "currentColor"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── resolution data types ─────────────────────────────────────────────────────

type ResolutionOption = {
  id: number;
  name: string;
  width: number | null;
  height: number | null;
  slug: string | null;
  showInSidebar: boolean | null;
};
type ResolutionGroup = { type: { id: number; name: string }; resolutions: ResolutionOption[] };

// ── format meta ───────────────────────────────────────────────────────────────

const FORMAT_META: Record<Format, { desc: string; color: string; lossy: boolean }> = {
  jpeg: { desc: "Universal · Great quality", color: "#ff9a6a", lossy: true },
  jpg:  { desc: "Universal · Great quality", color: "#ff6a8a", lossy: true },
  webp: { desc: "Modern · Smallest size",    color: "#7fe6f5", lossy: false },
  avif: { desc: "Next-gen · Best ratio",      color: "#a5b4fc", lossy: false },
};

// ── download modal ────────────────────────────────────────────────────────────

export function DownloadModal({
  wallpaper,
  onClose,
}: {
  wallpaper: WallpaperItem;
  onClose: () => void;
}) {
  const [fmt, setFmt] = useState<Format>("jpeg");
  const [groups, setGroups] = useState<ResolutionGroup[] | null>(null);
  const [selectedRes, setSelectedRes] = useState<ResolutionOption | null>(null); // null = Original
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  // fetch only resolutions that have an actual variant for this wallpaper
  useEffect(() => {
    fetch(`/api/resolutions?uuid=${encodeURIComponent(wallpaper.uuid)}`)
      .then((r) => r.json())
      .then((d: { groups: ResolutionGroup[] }) => setGroups(d.groups))
      .catch(() => setGroups([]));
  }, [wallpaper.uuid]);

  // re-sign whenever format or resolution changes
  useEffect(() => {
    let cancelled = false;
    setSigning(true);
    setSignedUrl(null);

    const params = new URLSearchParams({ uuid: wallpaper.uuid, f: fmt });
    if (selectedRes?.width) params.set("w", String(selectedRes.width));
    if (selectedRes?.height) params.set("h", String(selectedRes.height));

    fetch(`/api/sign-download?${params}`)
      .then((r) => r.json())
      .then((d: { url?: string }) => {
        if (!cancelled && d.url) setSignedUrl(d.url);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSigning(false); });

    return () => { cancelled = true; };
  }, [wallpaper.uuid, fmt, selectedRes]);

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fmtMeta = FORMAT_META[fmt];
  const resLabel = selectedRes
    ? `${selectedRes.width?.toLocaleString()} × ${selectedRes.height?.toLocaleString()}`
    : wallpaper.width && wallpaper.height
    ? `${wallpaper.width.toLocaleString()} × ${wallpaper.height.toLocaleString()}`
    : "Original";

  // Fallback URL (legacy, unsecured) used only if signing fails
  const fallbackHref = wallpaperDownloadPath(wallpaper.uuid, {
    format: fmt,
    ...(selectedRes?.width ? { width: selectedRes.width } : {}),
  });

  const href = signedUrl ?? fallbackHref;

  const totalResolutions = groups?.reduce((a, g) => a + g.resolutions.length, 0) ?? 0;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "rgba(0,0,0,.75)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-[500px] rounded-t-[24px] sm:rounded-[24px] flex flex-col overflow-hidden"
        style={{
          background: "var(--surface, #18181c)",
          border: "1px solid var(--line2, rgba(255,255,255,.09))",
          boxShadow: "0 40px 100px rgba(0,0,0,.85)",
          animation: "fadeUp .22s cubic-bezier(.22,.68,0,1.15) both",
          maxHeight: "92dvh",
        }}
      >
        {/* ── header ── */}
        <div className="flex items-center gap-4 px-5 pt-5 pb-4 flex-none">
          <div
            className="w-[72px] h-[48px] rounded-[10px] overflow-hidden flex-none"
            style={{ border: "1px solid rgba(255,255,255,.08)" }}
          >
            <img src={wallpaper.thumbUrl} alt={wallpaper.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[15px] truncate leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {wallpaper.title}
            </div>
            <div className="flex items-center gap-1.5 mt-[5px]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="text-[11.5px]" style={{ color: "var(--dim)" }}>
                {wallpaper.width && wallpaper.height
                  ? `${wallpaper.width.toLocaleString()} × ${wallpaper.height.toLocaleString()} px original`
                  : "Original size"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer flex-none transition-colors hover:bg-[var(--surface2)]"
            style={{ color: "var(--dim2)", background: "var(--surface2, rgba(255,255,255,.06))" }}
            aria-label="Close"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ height: 1, background: "var(--line, rgba(255,255,255,.07))", flexShrink: 0 }} />

        {/* ── scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-5" style={{ overscrollBehavior: "contain" }}>

          {/* ── RESOLUTION section ── */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-bold tracking-[0.8px] uppercase" style={{ color: "var(--muted, rgba(255,255,255,.38))" }}>
                Resolution
              </span>
              {selectedRes && (
                <button
                  type="button"
                  onClick={() => setSelectedRes(null)}
                  className="text-[11px] font-semibold border-none bg-transparent cursor-pointer"
                  style={{ color: "#ff6a8a" }}
                >
                  Reset to original
                </button>
              )}
            </div>

            {/* Original tile */}
            <button
              type="button"
              onClick={() => setSelectedRes(null)}
              className="w-full flex items-center gap-3 rounded-[13px] px-[14px] py-[12px] mb-3 border-none cursor-pointer transition-all text-left"
              style={{
                background: selectedRes === null ? "rgba(255,46,99,.1)" : "var(--surface2, rgba(255,255,255,.05))",
                border: `1.5px solid ${selectedRes === null ? "#ff2e63" : "var(--line, rgba(255,255,255,.08))"}`,
                boxShadow: selectedRes === null ? "0 0 0 3px rgba(255,46,99,.1)" : "none",
              }}
            >
              <span
                className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-none text-[13px] font-black"
                style={{
                  background: selectedRes === null ? "rgba(255,46,99,.18)" : "rgba(255,255,255,.07)",
                  color: selectedRes === null ? "#ff6a8a" : "var(--dim)",
                }}
              >
                ★
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[13.5px] leading-tight">Original</div>
                <div className="text-[11.5px] mt-[2px]" style={{ color: "var(--dim)" }}>
                  {wallpaper.width && wallpaper.height
                    ? `${wallpaper.width.toLocaleString()} × ${wallpaper.height.toLocaleString()} px — best quality`
                    : "Highest available resolution"}
                </div>
              </div>
              {selectedRes === null && (
                <span
                  className="text-[9.5px] font-bold px-[8px] py-[3px] rounded-full flex-none"
                  style={{ background: "rgba(255,46,99,.25)", color: "#ff6a8a" }}
                >
                  SELECTED
                </span>
              )}
            </button>

            {/* grouped resolution tiles */}
            {groups === null ? (
              <div className="flex flex-col gap-2">
                {[1,2].map((i) => (
                  <div key={i} className="h-[80px] rounded-[13px] animate-pulse" style={{ background: "var(--surface2)" }} />
                ))}
              </div>
            ) : totalResolutions === 0 ? null : (
              <div className="flex flex-col gap-4">
                {groups.map((g) => (
                  <div key={g.type.id}>
                    <div className="text-[11px] font-bold mb-2 pl-1" style={{ color: "var(--dim3, rgba(255,255,255,.3))" }}>
                      {g.type.name}
                    </div>
                    <div className="grid grid-cols-3 gap-[7px]">
                      {g.resolutions.map((r) => {
                        const active = selectedRes?.id === r.id;
                        const label = r.name;
                        const dims = r.width && r.height ? `${r.width.toLocaleString()} × ${r.height.toLocaleString()}` : r.slug ?? "—";
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRes(r)}
                            className="flex flex-col items-start gap-[3px] rounded-[11px] px-[12px] py-[10px] border-none cursor-pointer transition-all text-left"
                            style={{
                              background: active ? "rgba(255,46,99,.1)" : "var(--surface2, rgba(255,255,255,.05))",
                              border: `1.5px solid ${active ? "#ff2e63" : "var(--line, rgba(255,255,255,.08))"}`,
                              boxShadow: active ? "0 0 0 3px rgba(255,46,99,.1)" : "none",
                            }}
                          >
                            <span className="font-bold text-[12.5px] leading-tight" style={{ color: active ? "#fff" : "var(--text)" }}>
                              {label}
                            </span>
                            <span className="text-[10.5px] leading-tight font-mono" style={{ color: "var(--dim)" }}>
                              {dims}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "var(--line, rgba(255,255,255,.07))", margin: "0 -20px 20px" }} />

          {/* ── FORMAT section ── */}
          <div className="mb-5">
            <div className="text-[10.5px] font-bold tracking-[0.8px] uppercase mb-3" style={{ color: "var(--muted, rgba(255,255,255,.38))" }}>
              Format
            </div>
            <div className="grid grid-cols-4 gap-[7px]">
              {FORMATS.map((f) => {
                const m = FORMAT_META[f.id];
                const active = fmt === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFmt(f.id)}
                    className="relative flex flex-col items-center gap-[6px] rounded-[12px] pt-[13px] pb-[10px] border-none cursor-pointer transition-all"
                    style={{
                      background: active ? "rgba(255,46,99,.1)" : "var(--surface2, rgba(255,255,255,.05))",
                      border: `1.5px solid ${active ? "#ff2e63" : "var(--line, rgba(255,255,255,.08))"}`,
                      boxShadow: active ? "0 0 0 3px rgba(255,46,99,.1)" : "none",
                    }}
                  >
                    <span className="w-[7px] h-[7px] rounded-full" style={{ background: active ? m.color : "rgba(255,255,255,.18)" }} />
                    <span className="text-[12.5px] font-bold" style={{ color: active ? "#fff" : "var(--dim)" }}>
                      .{f.label}
                    </span>
                    {f.note && (
                      <span
                        className="absolute -top-[7px] left-1/2 -translate-x-1/2 text-[8px] font-bold px-[6px] py-[2px] rounded-full whitespace-nowrap"
                        style={{ background: "#ff2e63", color: "#fff" }}
                      >
                        default
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* format info */}
            <div
              className="flex items-center gap-2.5 mt-3 rounded-[10px] px-[13px] py-[10px]"
              style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}
            >
              <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: fmtMeta.color }} />
              <span className="text-[12.5px] font-semibold">.{fmt.toUpperCase()}</span>
              <span style={{ color: "var(--line)" }}>·</span>
              <span className="text-[12px]" style={{ color: "var(--dim)" }}>{fmtMeta.desc}</span>
              <span
                className="ml-auto text-[10px] font-bold px-[7px] py-[2px] rounded-full"
                style={{
                  background: fmtMeta.lossy ? "rgba(251,191,36,.12)" : "rgba(48,164,108,.12)",
                  color: fmtMeta.lossy ? "#fbbf24" : "#5fd398",
                }}
              >
                {fmtMeta.lossy ? "lossy" : "lossless"}
              </span>
            </div>
          </div>
        </div>

        {/* ── sticky footer CTA ── */}
        <div
          className="px-5 pb-5 pt-4 flex-none"
          style={{ borderTop: "1px solid var(--line, rgba(255,255,255,.07))", background: "var(--surface)" }}
        >
          <a
            href={href}
            download
            onClick={onClose}
            aria-disabled={signing}
            className="flex items-center justify-center gap-[9px] w-full rounded-[14px] py-[14px] font-bold text-[15px] text-white no-underline transition-all active:scale-[.98]"
            style={{
              background: signing
                ? "linear-gradient(135deg,rgba(255,46,99,.5),rgba(255,106,61,.5))"
                : "linear-gradient(135deg,#ff2e63,#ff6a3d)",
              boxShadow: signing ? "none" : "0 6px 22px rgba(255,46,99,.4)",
              cursor: signing ? "wait" : "pointer",
            }}
          >
            {signing ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="animate-spin">
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.3)" strokeWidth="2.5"/>
                <path d="M12 3a9 9 0 0 1 9 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 19h18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            )}
            {signing ? "Preparing…" : `Download .${fmt.toUpperCase()}`}
            {!signing && (
              <span className="ml-1 text-[12px] font-medium opacity-75">
                — {resLabel}
              </span>
            )}
          </a>
          <p className="text-center text-[11px] mt-2.5" style={{ color: "var(--dim3, rgba(255,255,255,.22))" }}>
            Free · No watermark · No sign-up required
          </p>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

// ── wallpaper card ────────────────────────────────────────────────────────────

export function WallpaperCard({ wallpaper }: WallpaperCardProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [shortlisted, setShortlisted] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const author = wallpaper.authorName ?? wallpaper.username ?? "Creator";

  async function handleLike(value: boolean) {
    if (liked === value) return;
    setLiked(value);
    await likeWallpaper(wallpaper.id, value);
  }

  async function handleShortlist() {
    setShortlisted((v) => !v);
    await toggleShortlist(wallpaper.id);
  }

  const detailHref = `${prefix}/wallpapers/${wallpaper.slug}`;

  return (
    <article
      className="relative rounded-[15px] overflow-hidden transition-all duration-[180ms] hover:-translate-y-1"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Stretched link — covers entire card at z-0; buttons sit above at z-10 */}
      <Link
        href={detailHref}
        className="absolute inset-0 z-0"
        aria-label={wallpaper.title}
        tabIndex={-1}
      />

      <div className="relative aspect-video overflow-hidden">
        {/* Image (no extra Link needed — stretched link above covers it) */}
        <Image
          src={wallpaper.thumbUrl || "/placeholder.webp"}
          alt={wallpaper.title}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 768px) 50vw, 252px"
          unoptimized
        />

        {/* category badge */}
        {wallpaper.categoryName && (
          <span
            className="absolute top-2.5 left-2.5 z-10 px-2 py-1 rounded-[7px] text-[11px] font-semibold pointer-events-none"
            style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)", color: "#e6e6ea" }}
          >
            {wallpaper.categoryName}
          </span>
        )}

        {/* 4K badge */}
        <span
          className="absolute top-2.5 right-[46px] z-10 px-2 py-1 rounded-[7px] text-[10px] font-bold tracking-[0.4px] pointer-events-none"
          style={{ background: "rgba(34,211,238,.16)", border: "1px solid rgba(34,211,238,.35)", color: "#7fe6f5" }}
        >
          4K
        </span>

        {/* shortlist bookmark — always visible, z-10 so it's above the stretched link */}
        <button
          type="button"
          title={t("shortlist")}
          onClick={(e) => { e.stopPropagation(); handleShortlist(); }}
          className="absolute top-2 right-2 z-10 w-[30px] h-[30px] flex items-center justify-center rounded-lg cursor-pointer transition-colors"
          style={{ background: "rgba(0,0,0,.52)", backdropFilter: "blur(6px)", color: shortlisted ? "#fbbf24" : "#e6e6ea" }}
        >
          <IconBookmark filled={shortlisted} />
        </button>

        {/* hover overlay — desktop only (hidden on touch/mobile) */}
        <div
          className="absolute inset-0 z-10 hidden sm:flex flex-col justify-end p-2.5 transition-opacity duration-[180ms]"
          style={{
            background: "linear-gradient(0deg, rgba(8,8,10,.9), rgba(8,8,10,.08) 55%)",
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          {showDownload && (
            <DownloadModal wallpaper={wallpaper} onClose={() => setShowDownload(false)} />
          )}

          <div className="flex gap-[6px] w-full items-center">
            {/* download trigger */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowDownload(true); }}
              className="flex-1 flex items-center justify-center gap-[7px] rounded-[9px] py-[9px] font-bold text-[12.5px] text-white border-none cursor-pointer"
              style={{ background: "linear-gradient(135deg, #ff2e63, #ff6a3d)", boxShadow: "0 3px 12px rgba(255,46,99,.35)" }}
            >
              <IconDownload />
              {t("download")}
            </button>

            {/* like */}
            <ActionBtn active={liked === true} activeColor="#ff2e63" title="Like"
              onClick={() => handleLike(true)}>
              <IconHeart filled={liked === true} />
            </ActionBtn>

            {/* dislike */}
            <ActionBtn active={liked === false} activeColor="rgba(255,255,255,.3)" title="Dislike"
              onClick={() => handleLike(false)}>
              <IconThumbDown filled={liked === false} />
            </ActionBtn>

            {/* shortlist */}
            <ActionBtn active={shortlisted} activeColor="#fbbf24" title={t("shortlist")}
              onClick={handleShortlist}>
              <IconBookmark filled={shortlisted} />
            </ActionBtn>
          </div>
        </div>
      </div>

      {/* Card footer — sits above the stretched link so text is selectable */}
      <div className="relative z-10 px-[13px] py-3 pointer-events-none">
        <div className="font-bold text-sm truncate mb-2" style={{ color: "var(--text)" }}>{wallpaper.title}</div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-[7px] min-w-0">
            <span
              className="w-5 h-5 rounded-full flex-none flex items-center justify-center text-[9px] font-bold"
              style={{ background: "var(--surface2)", color: "var(--muted)" }}
            >
              {author[0]?.toUpperCase()}
            </span>
            <span className="text-xs truncate" style={{ color: "var(--muted)" }}>
              {author}
            </span>
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold flex-none" style={{ color: "var(--dim)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="var(--dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {formatCount(wallpaper.downloads)}
          </span>
        </div>
      </div>
    </article>
  );
}

// ── action button ─────────────────────────────────────────────────────────────

function ActionBtn({
  children,
  active,
  activeColor,
  title,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  activeColor: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="w-[34px] h-[34px] flex-none flex items-center justify-center rounded-[9px] cursor-pointer transition-all"
      style={{
        background: active ? activeColor : "rgba(255,255,255,.1)",
        border: `1px solid ${active ? "transparent" : "rgba(255,255,255,.18)"}`,
        color: active ? "#fff" : "rgba(255,255,255,.8)",
        transform: active ? "scale(1.08)" : "scale(1)",
      }}
    >
      {children}
    </button>
  );
}

// ── api helpers ───────────────────────────────────────────────────────────────

async function likeWallpaper(id: number, like: boolean) {
  await fetch("/api/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallpaperId: id, like }),
  });
}


async function toggleShortlist(id: number) {
  await fetch("/api/shortlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallpaperId: id }),
  });
}

// ── skeleton card ─────────────────────────────────────────────────────────────

export function WallpaperCardSkeleton() {
  return (
    <div
      className="rounded-[15px] overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <div className="shimmer aspect-video w-full" style={{ borderRadius: 0 }} />
      <div className="px-[13px] py-3 flex flex-col gap-2">
        <div className="shimmer h-[14px] w-3/4 rounded-md" />
        <div className="flex items-center justify-between">
          <div className="shimmer h-[11px] w-1/3 rounded-md" />
          <div className="shimmer h-[11px] w-[40px] rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function WallpaperGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="hd-card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <WallpaperCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── wallpaper grid ────────────────────────────────────────────────────────────

interface WallpaperGridProps {
  items: WallpaperItem[];
  searchQuery?: string;
  clearSearchHref?: string;
}

export function WallpaperGrid({ items, searchQuery, clearSearchHref }: WallpaperGridProps) {
  const t = useTranslations("common");

  if (items.length === 0) {
    return (
      <div
        className="py-[60px] px-5 text-center rounded-2xl mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <div className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {searchQuery ? t("noResultsFor", { query: searchQuery }) : t("noResults")}
        </div>
        <div className="text-sm mb-4" style={{ color: "var(--dim)" }}>
          {t("noResultsHint")}
        </div>
        {clearSearchHref && (
          <Link
            href={clearSearchHref}
            className="inline-flex items-center gap-1.5 text-sm font-bold no-underline hover:underline"
            style={{ color: "#ff6a8a" }}
          >
            {t("clearSearch")}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="hd-card-grid">
      {items.map((wall) => (
        <WallpaperCard key={wall.id} wallpaper={wall} />
      ))}
    </div>
  );
}
