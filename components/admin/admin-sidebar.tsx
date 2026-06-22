"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  { href: "/admin/users", label: "Users", icon: "users", color: "#b794f6", bg: "rgba(139,92,246,.13)" },
  { href: "/admin/member-settings", label: "Member Settings", icon: "members", color: "#22d3ee", bg: "rgba(34,211,238,.1)" },
  { href: "/admin/categories", label: "Categories", icon: "categories", color: "#6ee7a0", bg: "rgba(48,164,108,.12)" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics", color: "#a5b4fc", bg: "rgba(99,102,241,.13)" },
  { href: "/admin/wallpaper-defaults", label: "Wallpaper Defaults", icon: "wallDefaults", color: "#ffb088", bg: "rgba(255,106,61,.13)" },
  { href: "/admin/resolutions", label: "Resolutions", icon: "resolutions", color: "#7fe6f5", bg: "rgba(34,211,238,.1)" },
  { href: "/admin/licenses", label: "Licenses", icon: "licenses", color: "#fbbf24", bg: "rgba(251,191,36,.1)" },
  { href: "/admin/pages", label: "Pages", icon: "pages", color: "#86efac", bg: "rgba(134,239,172,.1)" },
  { href: "/admin/ads", label: "Ads", icon: "ads", color: "#fb923c", bg: "rgba(251,146,60,.1)" },
  { href: "/admin/settings", label: "Settings", icon: "settings", color: "#cbd5e1", bg: "rgba(148,163,184,.13)" },
];

interface AdminSidebarProps {
  pendingCount?: number;
}

export function AdminSidebar({ pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="w-[236px] flex-none sticky top-0 h-screen flex flex-col py-[18px] px-[14px] border-r"
      style={{ background: "var(--bg2)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center gap-2.5 px-2 pb-5">
        <div className="flex flex-col gap-0.5">
          <Image
            src="/assets/logo.png"
            alt="HD Wallpapers"
            width={120}
            height={28}
            className="site-logo h-7 w-auto"
            priority
          />
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
        className="flex items-center gap-2 px-[13px] py-2.5 rounded-[10px] text-[13.5px] font-semibold no-underline border-t mt-2 transition-colors hover:text-[var(--text)]"
        style={{ color: "var(--muted)", borderColor: "var(--line)" }}
      >
        <IconArrowLeft />
        Back to site
      </Link>
    </aside>
  );
}
