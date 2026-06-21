"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

interface Category {
  id: number;
  slug: string | null;
  name: string;
  totalWallpapers: number;
}

interface Resolution {
  id: number;
  slug: string | null;
  name: string;
  width: number | null;
  height: number | null;
}

interface ResolutionGroup {
  id: number;
  name: string;
  resolutions: Resolution[];
}

interface SidebarFiltersProps {
  categories: Category[];
  resolutions: Resolution[];
  resolutionGroups?: ResolutionGroup[];
  colors: string[];
  activeCategory?: string;
  activeResolution?: string;
  activeColor?: string;
}

export function SidebarFilters({
  categories,
  resolutions,
  resolutionGroups,
  colors,
  activeCategory,
  activeResolution,
  activeColor,
}: SidebarFiltersProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const [screenPx, setScreenPx] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const w = Math.round(window.screen.width * window.devicePixelRatio);
    const h = Math.round(window.screen.height * window.devicePixelRatio);
    setScreenPx({ w, h });
  }, []);

  // Flatten all resolutions across groups + flat list to find a name match
  const allResolutions: Resolution[] = useMemo(() => {
    const fromGroups = resolutionGroups?.flatMap((g) => g.resolutions) ?? [];
    const fromFlat = resolutions ?? [];
    // Merge, deduplicate by id
    const seen = new Set<number>();
    return [...fromGroups, ...fromFlat].filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [resolutions, resolutionGroups]);

  // Find a resolution whose width matches the screen width (primary match)
  // or whose width × height both match (exact match preferred)
  const matchedResolution = useMemo(() => {
    if (!screenPx) return null;
    const exact = allResolutions.find(
      (r) => r.width === screenPx.w && r.height === screenPx.h
    );
    if (exact) return exact;
    return allResolutions.find((r) => r.width === screenPx.w) ?? null;
  }, [screenPx, allResolutions]);

  const screenSize = screenPx ? `${screenPx.w} × ${screenPx.h}` : "";

  // Use grouped view when resolution groups are provided and non-empty
  const hasGroups = resolutionGroups && resolutionGroups.length > 0;

  // Auto-expand the group whose resolution is currently active; all others collapsed
  const defaultExpanded = useMemo(() => {
    if (!resolutionGroups) return new Set<number>();
    const active = resolutionGroups.find((g) =>
      g.resolutions.some((r) => r.slug === activeResolution)
    );
    return active ? new Set([active.id]) : new Set<number>();
  }, [resolutionGroups, activeResolution]);

  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(defaultExpanded);

  function toggleGroup(id: number) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside className="hd-sidebar w-[236px] flex-none lg:sticky lg:top-[84px] flex flex-col gap-[26px]">

      {/* ── Categories ── */}
      <div>
        <div className="hd-section-label mb-3">{t("categories")}</div>
        <div className="flex flex-col gap-0.5">
          {categories.map((cat) => {
            const active = activeCategory === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`${prefix}/category/${cat.slug}`}
                className="flex items-center justify-between px-[11px] py-2 rounded-[9px] text-[13.5px] transition-colors hover:bg-[var(--line)]"
                style={{
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--text)" : "var(--text2)",
                  background: active ? "var(--line)" : "transparent",
                }}
              >
                <span>{cat.name}</span>
                <span className="text-xs" style={{ color: "var(--dim2)" }}>
                  {cat.totalWallpapers}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Screen size card (after categories) ── */}
      {screenSize && (() => {
        const cardContent = (
          <>
            <div
              className="w-[34px] h-[34px] rounded-lg flex items-center justify-center flex-none"
              style={{ background: matchedResolution ? "rgba(255,46,99,.12)" : "rgba(34,211,238,.12)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="13" rx="2"
                  stroke={matchedResolution ? "#ff6a8a" : "#22d3ee"} strokeWidth="2" />
                <path d="M8 21h8M12 17v4"
                  stroke={matchedResolution ? "#ff6a8a" : "#22d3ee"} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold" style={{ color: "var(--dim2)" }}>
                {t("screenSize")}
              </div>
              <div className="flex items-baseline gap-[6px] flex-wrap">
                <span className="text-sm font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  {screenSize}
                </span>
                {matchedResolution && (
                  <span
                    className="text-[11px] font-bold px-[7px] py-[2px] rounded-full"
                    style={{ background: "rgba(255,46,99,.15)", color: "#ff6a8a" }}
                  >
                    {matchedResolution.name}
                  </span>
                )}
              </div>
            </div>
            {matchedResolution && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="flex-none opacity-40">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </>
        );

        return matchedResolution?.slug ? (
          <Link
            href={`${prefix}/resolution/${matchedResolution.slug}`}
            className="flex items-center gap-[11px] rounded-[13px] p-[13px] transition-colors hover:bg-[var(--surface2)]"
            style={{ background: "var(--surface)", border: "1px solid var(--line)", textDecoration: "none", color: "inherit" }}
          >
            {cardContent}
          </Link>
        ) : (
          <div
            className="flex items-center gap-[11px] rounded-[13px] p-[13px]"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            {cardContent}
          </div>
        );
      })()}

      {/* ── Resolutions (grouped by type) ── */}
      <div>
        <div className="hd-section-label mb-3">{t("resolutions")}</div>

        {hasGroups ? (
          <div className="flex flex-col gap-1">
            {resolutionGroups!.map((group) => {
              const isOpen = expandedGroups.has(group.id);
              const hasActive = group.resolutions.some((r) => r.slug === activeResolution);
              return (
                <div key={group.id}>
                  {/* Clickable group header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-[11px] py-[8px] rounded-[9px] transition-colors hover:bg-[var(--line)] cursor-pointer"
                    style={{
                      background: hasActive ? "rgba(255,46,99,.07)" : "transparent",
                      border: "none",
                    }}
                  >
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: hasActive ? "#ff6a8a" : "var(--text2)" }}
                    >
                      {group.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {hasActive && (
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-none"
                          style={{ background: "#ff2e63" }}
                        />
                      )}
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{
                          color: hasActive ? "#ff6a8a" : "var(--dim2)",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.18s ease",
                        }}
                      >
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>

                  {/* Resolution chips — only visible when expanded */}
                  {isOpen && (
                    <div className="flex flex-wrap gap-[6px] px-2 pt-2 pb-1">
                      {group.resolutions.map((res) => {
                        const active = activeResolution === res.slug;
                        return (
                          <Link
                            key={res.id}
                            href={res.slug ? `${prefix}/resolution/${res.slug}` : `${prefix}/`}
                            className="flex items-center gap-1.5 px-[10px] py-[5px] rounded-[8px] text-[12px] font-semibold transition-all"
                            style={
                              active
                                ? {
                                    background: "rgba(255,46,99,.14)",
                                    color: "#ff6a8a",
                                    border: "1px solid rgba(255,46,99,.35)",
                                  }
                                : {
                                    background: "var(--surface2)",
                                    color: "var(--muted)",
                                    border: "1px solid var(--line)",
                                  }
                            }
                          >
                            {res.width && res.height && (
                              <span
                                className="text-[10px] font-mono opacity-60"
                                style={{ color: active ? "#ff6a8a" : "var(--dim)" }}
                              >
                                {res.width}×{res.height}
                              </span>
                            )}
                            <span>{res.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback: flat chip list from resolutions prop */
          <div className="flex flex-wrap gap-[7px]">
            {resolutions.map((res) => {
              const active = activeResolution === res.slug;
              return (
                <Link
                  key={res.id}
                  href={res.slug ? `${prefix}/resolution/${res.slug}` : `${prefix}/`}
                  className="px-3 py-1.5 rounded-[9px] text-xs font-semibold transition-colors"
                  style={
                    active
                      ? {
                          background: "rgba(255,46,99,.14)",
                          color: "#ff6a8a",
                          border: "1px solid rgba(255,46,99,.35)",
                        }
                      : {
                          background: "var(--surface2)",
                          color: "var(--muted)",
                          border: "1px solid var(--line)",
                        }
                  }
                >
                  {res.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Colors ── */}
      {colors.length > 0 && (
        <div>
          <div className="hd-section-label mb-3">{t("colors")}</div>
          <div className="flex flex-wrap gap-[9px]">
            {colors.map((color) => {
              const slug = color.replace("#", "");
              const active = activeColor === slug;
              return (
                <Link
                  key={color}
                  href={`${prefix}/color/${encodeURIComponent(slug)}`}
                  title={color}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: color,
                    borderColor: active ? "#ff2e63" : "var(--line2)",
                    boxShadow: active ? "0 0 0 2px rgba(255,46,99,.35)" : undefined,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Ad slot ── */}
      <div className="hd-ad-placeholder py-[18px] px-3.5">
        <div
          className="text-[10px] tracking-[1px] uppercase mb-2"
          style={{ color: "var(--dim3)" }}
        >
          Advertisement
        </div>
        <div className="text-[13px] leading-[1.5]" style={{ color: "var(--dim2)" }}>
          300 × 250
          <br />
          Display unit
        </div>
      </div>
    </aside>
  );
}
