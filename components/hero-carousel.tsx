"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCount } from "@/lib/format";
import { wallpaperDownloadPath } from "@/lib/wallpaper-urls";

interface CarouselWallpaper {
  id: number;
  uuid: string;
  slug: string | null;
  title: string;
  thumbUrl: string;
  categoryName?: string | null;
  authorName?: string | null;
  username?: string | null;
  views?: number | null;
  downloads?: number | null;
}

interface HeroCarouselProps {
  wallpapers: CarouselWallpaper[];
  prefix: string;
  labels: { featured: string; download4k: string; preview: string };
}

const INTERVAL_MS = 6000;

export function HeroCarousel({ wallpapers, prefix, labels: t }: HeroCarouselProps) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animDir, setAnimDir] = useState<"next" | "prev">("next");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch / swipe support
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (idx: number, dir: "next" | "prev" = "next") => {
      setAnimDir(dir);
      setPrev(active);
      setActive(idx);
    },
    [active]
  );

  const next = useCallback(() => {
    goTo((active + 1) % wallpapers.length, "next");
  }, [active, goTo, wallpapers.length]);

  const back = useCallback(() => {
    goTo((active - 1 + wallpapers.length) % wallpapers.length, "prev");
  }, [active, goTo, wallpapers.length]);

  // Auto-advance
  useEffect(() => {
    if (paused || wallpapers.length <= 1) return;
    timerRef.current = setTimeout(next, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused, next, wallpapers.length]);

  // Clear prev slide after animation
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 600);
    return () => clearTimeout(t);
  }, [prev]);

  if (!wallpapers.length) return null;

  const wall = wallpapers[active];
  const author = wall.authorName ?? wall.username ?? "Creator";

  return (
    <section
      className="relative max-w-[1320px] mx-auto mt-4 sm:mt-6 px-3 sm:px-7"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) {
          if (dx < 0) next();
          else back();
        }
        touchStartX.current = null;
      }}
    >
      <div
        className="hd-hero relative rounded-[16px] sm:rounded-[20px] overflow-hidden border"
        style={{ height: "clamp(220px,40vw,440px)", borderColor: "var(--line)" }}
      >
        {/* Slides */}
        {wallpapers.map((w, i) => {
          const isActive = i === active;
          const isPrev = i === prev;
          if (!isActive && !isPrev) return null;

          const slideOut = isPrev
            ? (animDir === "next" ? "translateX(-6%) scale(.97)" : "translateX(6%) scale(.97)")
            : "translateX(0) scale(1)";
          const slideIn = isActive
            ? (animDir === "next" ? ["translateX(4%) scale(.98)", "translateX(0) scale(1)"] : ["translateX(-4%) scale(.98)", "translateX(0) scale(1)"])
            : null;

          return (
            <div
              key={w.id}
              className="absolute inset-0"
              style={{
                opacity: isPrev ? 0 : 1,
                transform: isPrev ? slideOut : undefined,
                transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(.22,.68,0,1.2)",
                zIndex: isActive ? 2 : 1,
              }}
            >
              <Image
                src={w.thumbUrl || "/placeholder.webp"}
                alt={w.title}
                fill
                className="object-cover"
                priority={i === 0}
                unoptimized
                style={
                  isActive && slideIn
                    ? {
                        animation: `heroSlideIn 0.55s cubic-bezier(.22,.68,0,1.2) both`,
                      }
                    : undefined
                }
              />
            </div>
          );
        })}

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-[3]"
          style={{ background: "linear-gradient(90deg,rgba(8,8,10,.92) 0%,rgba(8,8,10,.5) 45%,rgba(8,8,10,.04) 100%)" }} />
        <div className="absolute inset-0 z-[3]"
          style={{ background: "linear-gradient(0deg,rgba(8,8,10,.75),transparent 55%)" }} />

        {/* Content */}
        <div className="relative z-[4] h-full flex flex-col justify-end p-5 sm:p-10 max-w-[620px] text-white">
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <span className="inline-flex items-center gap-1.5 px-[10px] py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.5px] uppercase"
              style={{ background: "rgba(255,46,99,.16)", color: "#ff6a8a", border: "1px solid rgba(255,46,99,.3)" }}>
              {t.featured}
            </span>
            {wall.categoryName && (
              <span className="px-[10px] py-1 rounded-full text-[11px] sm:text-xs font-semibold hidden sm:inline"
                style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)", color: "rgba(255,255,255,.92)" }}>
                {wall.categoryName}
              </span>
            )}
          </div>

          <h1 className="hd-hero-title font-bold leading-[1.05] tracking-[-0.8px] sm:tracking-[-1px] mb-2 sm:mb-3.5 line-clamp-2"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(20px,4vw,42px)" }}>
            {wall.title}
          </h1>

          <div className="hd-hero-meta flex items-center gap-3 sm:gap-[18px] mb-4 sm:mb-6 text-[11px] sm:text-[13px] font-semibold text-white/80">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-5 h-5 rounded-full flex-none flex items-center justify-center text-[9px] font-bold"
                style={{ background: "var(--surface2)", color: "var(--muted)" }}>
                {author[0]?.toUpperCase()}
              </span>
              <span className="truncate max-w-[100px] sm:max-w-none">{author}</span>
            </span>
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
              {formatCount(wall.views)}
            </span>
            <span className="flex items-center gap-1 hidden sm:flex">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              {formatCount(wall.downloads)}
            </span>
          </div>

          <div className="hd-hero-btns flex gap-2 sm:gap-3">
            {wall.slug && (
              <>
                <Link href={wallpaperDownloadPath(wall.uuid, { format: "webp" })}
                  className="inline-flex items-center gap-2 rounded-[11px] sm:rounded-xl px-4 sm:px-[22px] py-2.5 sm:py-3.5 font-bold text-[13px] sm:text-[15px] text-white"
                  style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", boxShadow: "0 6px 20px rgba(255,46,99,.35)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 4-4m-4 4-4-4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
                  {t.download4k}
                </Link>
                <Link href={`${prefix}/wallpapers/${wall.slug}`}
                  className="rounded-[11px] sm:rounded-xl px-4 sm:px-[22px] py-2.5 sm:py-3.5 font-semibold text-[13px] sm:text-[15px] text-white backdrop-blur-sm"
                  style={{ background: "var(--line3)", border: "1px solid rgba(255,255,255,.3)" }}>
                  {t.preview}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Prev / Next arrows */}
        {wallpapers.length > 1 && (
          <>
            <button type="button" onClick={back} aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-[5] w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 sm:opacity-70 sm:hover:opacity-100"
              style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button type="button" onClick={next} aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-[5] w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-0 hover:opacity-100 sm:opacity-70 sm:hover:opacity-100"
              style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {wallpapers.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 z-[5] flex items-center gap-[6px]">
            {wallpapers.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i, i > active ? "next" : "prev")}
                aria-label={`Slide ${i + 1}`}
                className="rounded-full transition-all"
                style={{
                  width: i === active ? 20 : 7,
                  height: 7,
                  background: i === active ? "#ff2e63" : "rgba(255,255,255,.45)",
                }}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        {wallpapers.length > 1 && (
          <div className="absolute top-3.5 right-4 z-[5] text-[11px] font-bold text-white/60 hidden sm:block">
            {active + 1} / {wallpapers.length}
          </div>
        )}

        {/* Progress bar */}
        {wallpapers.length > 1 && !paused && (
          <div className="absolute bottom-0 left-0 right-0 z-[5] h-[2px]"
            style={{ background: "rgba(255,255,255,.12)" }}>
            <div
              key={`${active}-prog`}
              className="h-full"
              style={{
                background: "linear-gradient(90deg,#ff2e63,#ff6a3d)",
                animation: `heroProgress ${INTERVAL_MS}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes heroProgress {
          from { width: 0% }
          to   { width: 100% }
        }
        @keyframes heroSlideIn {
          from { transform: translateX(${animDir === "next" ? "4%" : "-4%"}) scale(.98); }
          to   { transform: translateX(0) scale(1); }
        }
      `}</style>
    </section>
  );
}
