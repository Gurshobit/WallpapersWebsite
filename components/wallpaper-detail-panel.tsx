"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SITE_URL } from "@/lib/routing";
import { formatCount } from "@/lib/format";
import { wallpaperDownloadPath } from "@/lib/wallpaper-urls";
import { DownloadModal } from "./wallpaper-card";
import { RichContent } from "./rich-content";
import { useWallpaperInteractions } from "./user-interactions-provider";

// ── resolution types ──────────────────────────────────────────────────────────

type Fmt = "jpeg" | "jpg" | "webp" | "avif";
const FMTS: { id: Fmt; label: string; note?: string }[] = [
  { id: "jpeg", label: "JPEG", note: "default" },
  { id: "jpg",  label: "JPG" },
  { id: "webp", label: "WebP" },
  { id: "avif", label: "AVIF" },
];

interface ResOpt {
  id: number;
  name: string;
  width: number | null;
  height: number | null;
  slug: string | null;
}
interface ResGroup { type: { id: number; name: string }; resolutions: ResOpt[] }

// ── device icon helper ────────────────────────────────────────────────────────

function DeviceIcon({ typeName }: { typeName: string }) {
  const lower = typeName.toLowerCase();
  if (lower.includes("mobile") || lower.includes("phone")) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    );
  }
  if (lower.includes("tablet")) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

// ── quick format picker modal ─────────────────────────────────────────────────

function FormatPickerModal({
  wallpaperUuid,
  wallpaperTitle,
  thumbUrl,
  resolution,
  onClose,
}: {
  wallpaperUuid: string;
  wallpaperTitle: string;
  thumbUrl?: string | null;
  resolution: ResOpt;
  onClose: () => void;
}) {
  const [fmt, setFmt] = useState<Fmt>("jpeg");
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSigning(true);
    setSignedUrl(null);
    const p = new URLSearchParams({ uuid: wallpaperUuid, f: fmt });
    if (resolution.width) p.set("w", String(resolution.width));
    if (resolution.height) p.set("h", String(resolution.height));
    fetch(`/api/sign-download?${p}`)
      .then((r) => r.json())
      .then((d: { url?: string }) => { if (!cancelled && d.url) setSignedUrl(d.url); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSigning(false); });
    return () => { cancelled = true; };
  }, [wallpaperUuid, fmt, resolution.width, resolution.height]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fallback = wallpaperDownloadPath(wallpaperUuid, {
    format: fmt,
    ...(resolution.width ? { width: resolution.width } : {}),
  });

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: "rgba(0,0,0,.8)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-[400px] rounded-t-[22px] sm:rounded-[22px] flex flex-col"
        style={{
          background: "var(--surface, #18181c)",
          border: "1px solid var(--line2, rgba(255,255,255,.09))",
          boxShadow: "0 40px 100px rgba(0,0,0,.85)",
          animation: "fadeUp .22s cubic-bezier(.22,.68,0,1.15) both",
        }}
      >
        {/* header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          {thumbUrl && (
            <div className="w-[60px] h-[40px] rounded-[8px] overflow-hidden flex-none"
              style={{ border: "1px solid rgba(255,255,255,.08)" }}>
              <Image src={thumbUrl} alt={wallpaperTitle} width={60} height={40} className="w-full h-full object-cover" unoptimized />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14px] truncate" style={{ fontFamily: "var(--font-heading)" }}>
              {resolution.width?.toLocaleString()} × {resolution.height?.toLocaleString()} px
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--dim)" }}>{resolution.name}</div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full flex-none transition-colors hover:bg-[var(--surface2)]"
            style={{ color: "var(--dim2)", background: "var(--surface2)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ height: 1, background: "var(--line)", flexShrink: 0 }} />

        {/* format picker */}
        <div className="px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.6px] mb-2.5" style={{ color: "var(--dim2)" }}>
            Choose Format
          </div>
          <div className="grid grid-cols-4 gap-2">
            {FMTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFmt(f.id)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-[10px] transition-all"
                style={{
                  background: fmt === f.id ? "rgba(255,46,99,.12)" : "var(--surface2)",
                  border: `1px solid ${fmt === f.id ? "rgba(255,46,99,.4)" : "var(--line2)"}`,
                  color: fmt === f.id ? "#ff6a8a" : "var(--muted)",
                }}
              >
                <span className="text-[12px] font-bold">{f.label}</span>
                {f.note && <span className="text-[9px]" style={{ color: "var(--dim2)" }}>{f.note}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* download button */}
        <div className="px-5 pb-5">
          <a
            href={signedUrl ?? fallback}
            download
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-[13px] rounded-[12px] font-bold text-[14px] text-white transition-opacity hover:opacity-90"
            style={{
              background: signing ? "rgba(255,46,99,.5)" : "linear-gradient(135deg,#ff2e63,#ff6a3d)",
              boxShadow: signing ? "none" : "0 4px 18px rgba(255,46,99,.35)",
              pointerEvents: signing ? "none" : "auto",
            }}
          >
            {signing ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12m0 0-4-4m4 4 4-4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 19h18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            )}
            {signing ? "Preparing…" : `Download ${fmt.toUpperCase()}`}
          </a>
        </div>
      </div>
    </div>
  );
}

interface DetailPanelProps {
  wallpaperId: number;
  wallpaperUuid: string;
  slug: string;
  title: string;
  /** On mobile the title is rendered above the image by the page; hide it inside the panel */
  hideTitle?: boolean;
  style?: React.CSSProperties;
  description?: string | null;
  categoryName: string;
  categorySlug?: string | null;
  licenseName: string;
  licenseUrl?: string | null;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string | null;
  views: number;
  downloads: number;
  likes: number;
  dateAdded?: Date | null;
  tags?: string | null;
  images: { id: number; width: number | null; height: number | null; format: string | null; url?: string | null }[];
  dominantColors?: string[] | null;
  prefix: string;
  width?: number | null;
  height?: number | null;
  thumbUrl?: string | null;
}

type Tab = "about" | "share" | "resolutions";

export function WallpaperDetailPanel(props: DetailPanelProps) {
  const t = useTranslations("common");
  const interactions = useWallpaperInteractions();
  const [tab, setTab] = useState<Tab>("about");
  const [liked, setLiked] = useState<boolean | null>(() =>
    interactions.getRating(props.wallpaperId)
  );
  const [shortlisted, setShortlisted] = useState(() =>
    interactions.isShortlisted(props.wallpaperId)
  );
  const [showDownload, setShowDownload] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [resGroups, setResGroups] = useState<ResGroup[] | null>(null);
  const [quickDl, setQuickDl] = useState<ResOpt | null>(null);
  const pageUrl = `${SITE_URL}${props.prefix}/wallpapers/${props.slug}`;
  const thumbAbsUrl = props.thumbUrl?.startsWith("http") ? props.thumbUrl : `${SITE_URL}${props.thumbUrl ?? ""}`;
  const embedCode = `<a href="${pageUrl}" target="_blank" rel="noopener noreferrer" title="${props.title}">\n  <img src="${thumbAbsUrl}" alt="${props.title}" width="1920" height="1080" style="max-width:100%;height:auto;border-radius:8px;" />\n</a>`;

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode).then(() => {
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    });
  }

  // Lazy-load resolution groups when the Resolutions tab is opened
  useEffect(() => {
    if (tab !== "resolutions" || resGroups !== null) return;
    fetch(`/api/resolutions?uuid=${encodeURIComponent(props.wallpaperUuid)}`)
      .then((r) => r.json())
      .then((d: { groups: ResGroup[] }) => setResGroups(d.groups))
      .catch(() => setResGroups([]));
  }, [tab, resGroups, props.wallpaperUuid]);

  async function handleLike(value: boolean) {
    const next = liked === value ? null : value;
    setLiked(next);
    interactions.setRating(props.wallpaperId, next);
    await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallpaperId: props.wallpaperId, like: value }),
    });
  }

  async function handleShortlist() {
    const next = !shortlisted;
    setShortlisted(next);
    interactions.setShortlisted(props.wallpaperId, next);
    const res = await fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallpaperId: props.wallpaperId }),
    });
    if (!res.ok) {
      setShortlisted(!next); // revert on error
      interactions.setShortlisted(props.wallpaperId, !next);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "about",       label: t("about"),           icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6v-4m0-4h.01" },
    { id: "share",       label: t("share"),           icon: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" },
    { id: "resolutions", label: t("resolutions_tab"), icon: "M12 3v12m0 0-4-4m4 4 4-4M3 19h18" },
  ];

  // Build a wallpaper-item shape compatible with DownloadModal
  const wallpaperForModal = {
    id: 0,
    uuid: props.wallpaperUuid,
    slug: props.slug,
    title: props.title,
    thumbUrl: props.thumbUrl ?? "",
    width: props.width,
    height: props.height,
  };

  return (
    <aside className="hd-detail-aside w-full lg:w-[380px] flex-none lg:sticky lg:top-[84px] flex flex-col gap-4" style={props.style}>
      {showDownload && (
        <DownloadModal wallpaper={wallpaperForModal} onClose={() => setShowDownload(false)} />
      )}
      {quickDl && (
        <FormatPickerModal
          wallpaperUuid={props.wallpaperUuid}
          wallpaperTitle={props.title}
          thumbUrl={props.thumbUrl}
          resolution={quickDl}
          onClose={() => setQuickDl(null)}
        />
      )}

      {/* Title + author card */}
      <div>
        {/* On mobile the title is shown above the image by the page; hide it here */}
        <h1
          className={`font-bold text-[22px] sm:text-[26px] tracking-[-0.5px] leading-[1.15] mb-3.5${props.hideTitle ? " hidden lg:block" : ""}`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {props.title}
        </h1>

        <div
          className="flex items-center justify-between rounded-[13px] px-3.5 py-3 mb-2.5"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="flex items-center gap-[11px]">
            <span
              className="w-[42px] h-[42px] rounded-full flex-none flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--surface2)", color: "var(--muted)" }}
            >
              {props.authorName[0]?.toUpperCase()}
            </span>
            <div>
              <div className="text-sm font-bold">{props.authorName}</div>
              <div className="text-xs" style={{ color: "var(--dim)" }}>Creator · credited</div>
            </div>
          </div>
          <Link
            href={`${props.prefix}/u/${props.authorHandle}`}
            className="rounded-[9px] px-[15px] py-2 text-[13px] font-bold no-underline transition-colors hover:bg-[var(--surface3)]"
            style={{ background: "var(--line)", border: "1px solid var(--line2)", color: "var(--text)" }}
          >
            Follow
          </Link>
        </div>

        {/* Stat mini-cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Views", value: props.views },
            { label: "Downloads", value: props.downloads },
            { label: "Likes", value: props.likes },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[11px] py-[11px] text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <div className="font-bold text-[17px]" style={{ fontFamily: "var(--font-heading)" }}>
                {formatCount(stat.value)}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--dim)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action row: Download + Like + Dislike + Shortlist */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowDownload(true)}
          className="flex-1 flex items-center justify-center gap-2 rounded-[11px] py-3 font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[.98]"
          style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", boxShadow: "0 4px 16px rgba(255,46,99,.3)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 19h18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          Download
        </button>

        {/* Like */}
        <PanelAction
          active={liked === true}
          activeColor="#ff2e63"
          activeBg="rgba(255,46,99,.12)"
          title="Like"
          onClick={() => handleLike(true)}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={liked === true ? "#ff2e63" : "none"}>
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
              stroke={liked === true ? "#ff2e63" : "currentColor"}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </PanelAction>

        {/* Dislike */}
        <PanelAction
          active={liked === false}
          activeColor="rgba(255,255,255,.5)"
          activeBg="rgba(255,255,255,.07)"
          title="Dislike"
          onClick={() => handleLike(false)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked === false ? "rgba(255,255,255,.4)" : "none"}>
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </PanelAction>

        {/* Shortlist bookmark */}
        <PanelAction
          active={shortlisted}
          activeColor="#fbbf24"
          activeBg="rgba(251,191,36,.12)"
          title={t("shortlist")}
          onClick={handleShortlist}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={shortlisted ? "#fbbf24" : "none"}>
            <path
              d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4Z"
              stroke={shortlisted ? "#fbbf24" : "currentColor"}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </PanelAction>
      </div>

      {/* Tabbed meta panel */}
      <div
        className="rounded-[15px] overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        {/* Tab bar */}
        <div className="flex" style={{ borderBottom: "1px solid var(--line)" }}>
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold transition-colors"
                style={{
                  color: active ? "#ff2e63" : "var(--muted)",
                  background: active ? "var(--surface2)" : "transparent",
                  borderBottom: active ? "2px solid #ff2e63" : "2px solid transparent",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {/* About tab */}
          {tab === "about" && (
            <div className="flex flex-col gap-3.5 text-sm">
              <MetaRow label="Category" value={props.categoryName} accent />
              <MetaRow label="Uploaded" value={props.dateAdded?.toLocaleDateString() ?? "—"} />
              <MetaRow label="License" value={props.licenseName} accentGreen />
              {props.width && props.height && (
                <MetaRow label="Resolution" value={`${props.width.toLocaleString()} × ${props.height.toLocaleString()} px`} />
              )}
              {props.description && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.6px] mb-1.5" style={{ color: "var(--dim2)" }}>
                    Description
                  </div>
                  <RichContent html={props.description} className="rte-prose rte-prose-sm" />
                </div>
              )}
            </div>
          )}

          {/* Share tab */}
          {tab === "share" && (
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs font-bold mb-2" style={{ color: "var(--dim2)" }}>Page link</div>
                <div className="flex gap-2">
                  <input readOnly value={pageUrl} className="hd-field text-xs flex-1 min-w-0" />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="px-4 rounded-[11px] text-xs font-bold flex-none transition-colors"
                    style={{
                      background: copyDone ? "rgba(48,164,108,.15)" : "var(--surface3)",
                      border: "1px solid var(--line2)",
                      color: copyDone ? "#5fd398" : "var(--text2)",
                    }}
                  >
                    {copyDone ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Social share buttons */}
              <div>
                <div className="text-xs font-bold mb-2" style={{ color: "var(--dim2)" }}>Share on</div>
                <div className="flex flex-wrap gap-2">
                  {([
                    {
                      name: "WhatsApp",
                      href: `https://wa.me/?text=${encodeURIComponent(props.title + " " + pageUrl)}`,
                      color: "#25d366",
                      icon: (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.12 1.533 5.849L.054 23.25a.75.75 0 0 0 .922.919l5.453-1.477A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.53-5.2-1.45l-.374-.223-3.88 1.05 1.07-3.797-.244-.389A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                      ),
                    },
                    {
                      name: "Facebook",
                      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
                      color: "#1877f2",
                      icon: (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                        </svg>
                      ),
                    },
                    {
                      name: "Instagram",
                      href: `https://www.instagram.com/?url=${encodeURIComponent(pageUrl)}`,
                      color: "#e1306c",
                      icon: (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                        </svg>
                      ),
                    },
                    {
                      name: "X / Twitter",
                      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(props.title)}`,
                      color: "#111111",
                      fg: "var(--text)",
                      icon: (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.256 5.63 5.908-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      ),
                    },
                    {
                      name: "Reddit",
                      href: `https://reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(props.title)}`,
                      color: "#ff4500",
                      icon: (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                        </svg>
                      ),
                    },
                    {
                      name: "Pinterest",
                      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&description=${encodeURIComponent(props.title)}&media=${encodeURIComponent(thumbAbsUrl)}`,
                      color: "#e60023",
                      icon: (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                        </svg>
                      ),
                    },
                  ] as { name: string; href: string; color: string; fg?: string; icon: React.ReactNode }[]).map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold no-underline transition-opacity hover:opacity-80"
                      style={{
                        background: `${s.color}22`,
                        color: s.fg ?? s.color,
                        border: `1px solid ${s.color}44`,
                      }}
                    >
                      {s.icon}
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Embed code */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--dim2)" }}>
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  <div className="text-xs font-bold" style={{ color: "var(--dim2)" }}>Embed on your website</div>
                </div>
                <div
                  className="relative rounded-[11px] p-3 font-mono text-[11px] leading-[1.7] select-all break-all"
                  style={{
                    background: "var(--surface3)",
                    border: "1px solid var(--line2)",
                    color: "var(--dim)",
                  }}
                >
                  <pre className="whitespace-pre-wrap m-0" style={{ fontFamily: "inherit" }}>
                    {embedCode}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={copyEmbed}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-bold transition-colors"
                  style={{
                    background: embedCopied ? "rgba(48,164,108,.12)" : "var(--surface2)",
                    border: `1px solid ${embedCopied ? "rgba(48,164,108,.35)" : "var(--line2)"}`,
                    color: embedCopied ? "#5fd398" : "var(--text2)",
                  }}
                >
                  {embedCopied ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Copy embed code
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Resolutions tab */}
          {tab === "resolutions" && (
            <div>
              {resGroups === null ? (
                /* shimmer loading */
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-32 rounded shimmer mb-3" style={{ background: "var(--line2)" }} />
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-[58px] rounded-[11px] shimmer" style={{ background: "var(--line2)" }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : resGroups.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-sm mb-3" style={{ color: "var(--dim)" }}>No variants available</div>
                  <button type="button" onClick={() => setShowDownload(true)} className="hd-btn-primary text-sm px-4 py-2">
                    Download original
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {resGroups.map((group) => (
                    <div key={group.type.id}
                      className="rounded-[13px] overflow-hidden"
                      style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}>
                      {/* Group header */}
                      <div className="flex items-center justify-between px-3.5 py-2.5"
                        style={{ borderBottom: "1px solid var(--line)" }}>
                        <div className="flex items-center gap-2" style={{ color: "var(--dim2)" }}>
                          <DeviceIcon typeName={group.type.name} />
                          <span className="text-[11.5px] font-bold uppercase tracking-[0.5px]">
                            {group.type.name}
                          </span>
                        </div>
                        <span className="text-[11px]" style={{ color: "var(--dim3)" }}>
                          {group.resolutions.length} {group.resolutions.length === 1 ? "size" : "sizes"}
                        </span>
                      </div>

                      {/* Resolution cards — 2-column grid */}
                      <div className="grid grid-cols-2 gap-px p-px" style={{ background: "var(--line)" }}>
                        {group.resolutions.map((res) => (
                          <button
                            key={res.id}
                            type="button"
                            onClick={() => setQuickDl(res)}
                            className="flex items-start justify-between p-3 transition-colors text-left"
                            style={{ background: "var(--surface2)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface3)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-[13px] leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                                {res.width?.toLocaleString()} × {res.height?.toLocaleString()}
                              </div>
                              {res.name && (
                                <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--dim)" }}>
                                  {res.name}
                                </div>
                              )}
                            </div>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="flex-none mt-0.5 ml-1" style={{ color: "var(--dim2)" }}>
                              <path d="M12 3v12m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function PanelAction({
  children,
  active,
  activeColor,
  activeBg,
  title,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  activeColor: string;
  activeBg: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-[44px] flex-none flex items-center justify-center rounded-[11px] transition-all"
      style={{
        background: active ? activeBg : "var(--surface2)",
        border: `1px solid ${active ? activeColor : "var(--line2)"}`,
        color: active ? activeColor : "var(--text3)",
        transform: active ? "scale(1.05)" : "scale(1)",
      }}
    >
      {children}
    </button>
  );
}

function MetaRow({
  label,
  value,
  accent,
  accentGreen,
}: {
  label: string;
  value: string;
  accent?: boolean;
  accentGreen?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.6px] mb-1" style={{ color: "var(--dim2)" }}>
        {label}
      </div>
      <div
        className="text-[13.5px] font-semibold"
        style={{ color: accent ? "#ff6a8a" : accentGreen ? "#30a46c" : "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}
