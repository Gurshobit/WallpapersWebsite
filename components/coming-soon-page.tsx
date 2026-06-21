"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Variant = "collections" | "community";

const VARIANTS: Record<
  Variant,
  {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    features: string[];
    cta: string;
    gradient: string;
    glow: string;
    orbitColor: string;
  }
> = {
  collections: {
    badge: "Curated worlds loading",
    title: "Collections are",
    titleAccent: "taking shape",
    subtitle:
      "Hand-picked mood boards, seasonal sets, and editor galaxies — stitched together so you can browse by vibe, not just keyword.",
    features: ["Mood boards", "Editor picks", "Seasonal sets", "Smart bundles"],
    cta: "Browse wallpapers",
    gradient:
      "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,189,248,.22), transparent 55%), radial-gradient(ellipse 60% 50% at 85% 70%, rgba(167,139,250,.18), transparent 50%)",
    glow: "rgba(56,189,248,.35)",
    orbitColor: "#38bdf8",
  },
  community: {
    badge: "Creators assembling",
    title: "Community is",
    titleAccent: "warming up",
    subtitle:
      "Profiles, challenges, and creator spotlights — a place to share process, not just pixels. The stage lights are dimmed for now.",
    features: ["Creator profiles", "Weekly challenges", "Spotlights", "Live feedback"],
    cta: "Meet our uploaders",
    gradient:
      "radial-gradient(ellipse 75% 55% at 20% 0%, rgba(255,46,99,.2), transparent 55%), radial-gradient(ellipse 55% 45% at 90% 80%, rgba(255,106,61,.16), transparent 50%)",
    glow: "rgba(255,46,99,.4)",
    orbitColor: "#ff6a8a",
  },
};

const FLOAT_CARDS = [
  { w: 88, h: 56, x: 12, y: 18, delay: 0, rot: -8 },
  { w: 72, h: 48, x: 78, y: 12, delay: 0.4, rot: 12 },
  { w: 96, h: 60, x: 68, y: 62, delay: 0.8, rot: -5 },
  { w: 64, h: 42, x: 8, y: 68, delay: 1.2, rot: 6 },
  { w: 56, h: 38, x: 42, y: 38, delay: 0.6, rot: -12 },
];

const NODES = [
  { x: 50, y: 28, r: 14 },
  { x: 28, y: 58, r: 11 },
  { x: 72, y: 55, r: 12 },
  { x: 38, y: 78, r: 9 },
  { x: 62, y: 76, r: 10 },
  { x: 50, y: 50, r: 16 },
];

export function ComingSoonPage({
  variant,
  prefix = "",
}: {
  variant: Variant;
  prefix?: string;
}) {
  const v = VARIANTS[variant];
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const wave = 62 + Math.sin(elapsed / 900) * 8 + (elapsed / 120000) * 3;
      setProgress(Math.min(89, wave));
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-140px)] overflow-hidden flex flex-col items-center justify-center px-5 py-16">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: v.gradient }}
      />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(720px,90vw)] h-[320px] rounded-full blur-[100px] opacity-40 pointer-events-none cs-breathe"
        style={{ background: v.glow }}
      />

      <div className="relative w-full max-w-[920px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Visual */}
          <div
            className="relative aspect-square max-w-[380px] mx-auto w-full cs-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            {variant === "collections" ? (
              <div className="absolute inset-0 cs-orbit-slow">
                {FLOAT_CARDS.map((card, i) => (
                  <div
                    key={i}
                    className="absolute rounded-xl border cs-float-card"
                    style={{
                      width: card.w,
                      height: card.h,
                      left: `${card.x}%`,
                      top: `${card.y}%`,
                      transform: `rotate(${card.rot}deg)`,
                      animationDelay: `${card.delay}s`,
                      background:
                        "linear-gradient(145deg, var(--surface2), var(--surface))",
                      borderColor: "var(--line2)",
                      boxShadow: `0 12px 40px rgba(0,0,0,.35), 0 0 0 1px ${v.orbitColor}22`,
                    }}
                  >
                    <div
                      className="absolute inset-2 rounded-lg opacity-60"
                      style={{
                        background: `linear-gradient(135deg, ${v.orbitColor}44, transparent)`,
                      }}
                    />
                  </div>
                ))}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl flex items-center justify-center cs-pulse-core"
                  style={{
                    background: "var(--surface)",
                    border: `2px solid ${v.orbitColor}55`,
                    boxShadow: `0 0 40px ${v.glow}`,
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4z"
                      stroke={v.orbitColor}
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full cs-orbit-slow"
                aria-hidden
              >
                {[
                  [0, 1],
                  [0, 2],
                  [0, 5],
                  [1, 3],
                  [2, 4],
                  [3, 5],
                  [4, 5],
                  [1, 5],
                ].map(([a, b], i) => (
                  <line
                    key={i}
                    x1={NODES[a].x}
                    y1={NODES[a].y}
                    x2={NODES[b].x}
                    y2={NODES[b].y}
                    stroke={v.orbitColor}
                    strokeOpacity="0.25"
                    strokeWidth="0.4"
                    className="cs-line-draw"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
                {NODES.map((node, i) => (
                  <g key={i} className="cs-node-pop" style={{ animationDelay: `${i * 0.1}s` }}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r / 3}
                      fill={v.orbitColor}
                      fillOpacity="0.2"
                      className="cs-pulse-ring"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r / 5}
                      fill={v.orbitColor}
                    />
                  </g>
                ))}
              </svg>
            )}
          </div>

          {/* Copy */}
          <div className="text-center lg:text-left cs-fade-up" style={{ animationDelay: "0.15s" }}>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] mb-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                color: v.orbitColor,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full cs-blink"
                style={{ background: v.orbitColor }}
              />
              {v.badge}
            </div>

            <h1
              className="font-bold text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] tracking-[-0.03em] mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {v.title}{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${v.orbitColor}, var(--accent-to))`,
                }}
              >
                {v.titleAccent}
              </span>
            </h1>

            <p
              className="text-[15px] leading-relaxed max-w-md mx-auto lg:mx-0 mb-7"
              style={{ color: "var(--text3)" }}
            >
              {v.subtitle}
            </p>

            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
              {v.features.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    color: "var(--muted)",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Progress */}
            <div className="mb-8 max-w-md mx-auto lg:mx-0">
              <div className="flex justify-between text-[11px] font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--dim)" }}>
                <span>Build progress</span>
                <span>{mounted ? `${Math.round(progress)}%` : "—"}</span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-300 cs-shimmer-bar"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${v.orbitColor}, var(--accent-to))`,
                  }}
                />
              </div>
              <p className="text-[11px] mt-2" style={{ color: "var(--dim2)" }}>
                Something worth the wait — we&apos;re polishing the experience.
              </p>
            </div>

            <Link
              href={variant === "community" ? `${prefix}/popular-wallpapers` : prefix || "/"}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-bold text-white no-underline transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #ff2e63, #ff6a3d)",
                boxShadow: "0 6px 24px rgba(255,46,99,.35)",
              }}
            >
              {v.cta}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
