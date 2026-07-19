"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteLogo } from "../site-logo";
import { AdminNavIcon, IconArrowLeft, type AdminNavIconKey } from "./admin-icons";
import { AdminAppearanceToggle } from "./admin-appearance-toggle";
import { PLATFORM_VERSION } from "@/lib/version";

const NAV: {
  href: string;
  label: string;
  icon: AdminNavIconKey;
  badgeKey?: "pending";
  color: string;
  bg: string;
}[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", color: "#ff6a8a", bg: "rgba(255,46,99,.13)" },
  { href: "/admin/moderation", label: "Moderation", icon: "moderation", badgeKey: "pending", color: "#f5c518", bg: "rgba(245,197,24,.13)" },
  { href: "/admin/wallpapers", label: "Wallpapers", icon: "wallpapers", color: "#7fe6f5", bg: "rgba(34,211,238,.12)" },
  { href: "/admin/collections", label: "Collections", icon: "collections", color: "#c4b5fd", bg: "rgba(139,92,246,.13)" },
  { href: "/admin/community", label: "Community", icon: "community", color: "#67e8f9", bg: "rgba(34,211,238,.12)" },
  { href: "/admin/users", label: "Users", icon: "users", color: "#b794f6", bg: "rgba(139,92,246,.13)" },
  { href: "/admin/member-settings", label: "Member Settings", icon: "members", color: "#22d3ee", bg: "rgba(34,211,238,.1)" },
  { href: "/admin/categories", label: "Categories", icon: "categories", color: "#6ee7a0", bg: "rgba(48,164,108,.12)" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics", color: "#a5b4fc", bg: "rgba(99,102,241,.13)" },
  { href: "/admin/wallpaper-defaults", label: "Wallpaper Defaults", icon: "wallDefaults", color: "#ffb088", bg: "rgba(255,106,61,.13)" },
  { href: "/admin/resolutions", label: "Resolutions", icon: "resolutions", color: "#7fe6f5", bg: "rgba(34,211,238,.1)" },
  { href: "/admin/licenses", label: "Licenses", icon: "licenses", color: "#fbbf24", bg: "rgba(251,191,36,.1)" },
  { href: "/admin/pages", label: "Pages", icon: "pages", color: "#86efac", bg: "rgba(134,239,172,.1)" },
  { href: "/admin/ads", label: "Ads", icon: "ads", color: "#fb923c", bg: "rgba(251,146,60,.1)" },
  { href: "/admin/languages", label: "Languages", icon: "languages", color: "#93c5fd", bg: "rgba(59,130,246,.12)" },
  { href: "/admin/settings", label: "Settings", icon: "settings", color: "#cbd5e1", bg: "rgba(148,163,184,.13)" },
];

interface AdminSidebarProps {
  pendingCount?: number;
}

function SidebarInner({
  pendingCount,
  pathname,
  onNavigate,
}: {
  pendingCount: number;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-2 pb-5">
        <div className="flex flex-col gap-0.5">
          <SiteLogo height={28} className="h-7 w-auto" priority />
          <div className="text-[10px] tracking-[0.3px]" style={{ color: "var(--dim2)" }}>
            Admin panel · v{PLATFORM_VERSION}
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-[3px] flex-1 overflow-y-auto">
        {NAV.map(({ href, label, icon, badgeKey, color, bg }) => {
          const active = pathname === href ||
            (href === "/admin/settings" && pathname.startsWith("/admin/settings"));
          const badge = badgeKey === "pending" ? pendingCount : 0;

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className="flex items-center gap-[11px] px-[13px] py-2.5 rounded-[10px] text-[13.5px] font-semibold transition-colors no-underline"
              style={
                active
                  ? {
                      background: "rgba(255,46,99,.14)",
                      color: "#ff2e63",
                      fontWeight: 700,
                    }
                  : { color: "var(--muted)", fontWeight: 500 }
              }
            >
              <span
                className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-none"
                style={{
                  background: active ? "rgba(255,46,99,.18)" : bg,
                  color: active ? "#ff2e63" : color,
                }}
              >
                <AdminNavIcon name={icon} size={16} />
              </span>
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span
                  className="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: "#ff2e63" }}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <AdminAppearanceToggle />

      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2 px-[13px] py-2.5 rounded-[10px] text-[13.5px] font-semibold no-underline border-t mt-2 transition-colors hover:text-[var(--text)]"
        style={{ color: "var(--muted)", borderColor: "var(--line)" }}
      >
        <IconArrowLeft />
        Back to site
      </Link>
    </>
  );
}

export function AdminSidebar({ pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className="hidden md:flex w-[200px] lg:w-[236px] flex-none sticky top-0 h-screen flex-col py-[18px] px-[14px] border-r"
        style={{ background: "var(--bg2)", borderColor: "var(--line)" }}
      >
        <SidebarInner pendingCount={pendingCount} pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center gap-3 px-4 border-b"
        style={{ background: "var(--bg2)", borderColor: "var(--line)" }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="w-9 h-9 -ml-1 rounded-[9px] flex items-center justify-center flex-none cursor-pointer"
          style={{ color: "var(--text)", background: "var(--surface2)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <SiteLogo height={24} className="h-6 w-auto" />
        <span className="text-[11px] font-semibold" style={{ color: "var(--dim2)" }}>
          Admin
        </span>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,.5)" }}
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute top-0 left-0 h-full w-[264px] max-w-[85vw] flex flex-col py-[18px] px-[14px] border-r overflow-y-auto"
            style={{ background: "var(--bg2)", borderColor: "var(--line)", animation: "slideInLeft .25s ease both" }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close admin menu"
              className="absolute top-3 right-3 w-8 h-8 rounded-[9px] flex items-center justify-center cursor-pointer"
              style={{ color: "var(--muted)", background: "var(--surface2)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <SidebarInner
              pendingCount={pendingCount}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
