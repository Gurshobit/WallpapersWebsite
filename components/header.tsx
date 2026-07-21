"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { HeaderSearch } from "./header-search";
import { ShortlistBadge } from "./shortlist-badge";
import { SiteLogo } from "./site-logo";

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function Header({
  canRegister = true,
  canSubmit = true,
  isStaff = false,
  isAdmin = false,
}: {
  canRegister?: boolean;
  canSubmit?: boolean;
  isStaff?: boolean;
  isAdmin?: boolean;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const [mobileOpen, setMobileOpen] = useState(false);
  // Admin routes are not localized; moderators land on Moderation.
  const adminHref = isAdmin ? "/admin" : "/admin/moderation";

  // Show the filter button only on browse/listing pages
  const cleanPath = pathname.replace(/^\/(ar|de|es|fr|hi|ja|pt)/, "") || "/";
  const showFilterBtn =
    cleanPath === "/" ||
    cleanPath.startsWith("/category/") ||
    cleanPath.startsWith("/color/") ||
    cleanPath.startsWith("/resolution/") ||
    cleanPath.startsWith("/tag/") ||
    cleanPath.startsWith("/search") ||
    cleanPath === "/popular-wallpapers" ||
    cleanPath === "/latest-wallpapers" ||
    cleanPath === "/top-downloaded-wallpapers" ||
    cleanPath.startsWith("/u/");

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const nav = [
    {
      href: `${prefix}/`,
      label: t("navExplore"),
      active: pathname === `${prefix}/` || pathname === "/",
      icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-5l5.6-7.5-7.5 5.6 1.9 1.9z",
    },
    {
      href: `${prefix}/collections`,
      label: t("navCollections"),
      active: pathname.includes("/collections"),
      icon: "M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4z",
    },
    {
      href: `${prefix}/community`,
      label: t("navCommunity"),
      active: pathname.includes("/community"),
      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    },
  ];

  return (
    <>
      {/* Sticky wrapper for both header rows — keeps z-50 stacking context over hero */}
      <div className="hd-header glass-header sticky top-0 z-50">
        <header className="flex items-center gap-2.5 lg:gap-4 px-5 sm:px-7 py-3">

          {/* Logo */}
          <Link href={prefix || "/"} className="flex items-center flex-none">
            <SiteLogo height={36} className="h-[32px] sm:h-[36px] w-auto" priority />
          </Link>

          {/* Desktop nav — icon-only in the md-lg range to save room, labels return at lg */}
          <nav className="hd-header-nav hidden md:flex items-center gap-1 flex-none">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}
                title={item.label}
                className="inline-flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-[9px] text-sm font-semibold transition-colors no-underline"
                style={item.active ? { color: "var(--text)", background: "var(--line)" } : { color: "var(--muted)" }}
              >
                <NavIcon d={item.icon} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Search — hidden on smallest screens, shown on sm+ */}
          <div className="hidden sm:flex flex-1 min-w-0">
            <HeaderSearch />
          </div>

          {/* Tablet filters trigger — sidebar is hidden below lg, so surface the drawer here */}
          {showFilterBtn && (
            <button
              type="button"
              aria-label="Open filters"
              onClick={() => window.dispatchEvent(new CustomEvent("hd:open-filters"))}
              className="hidden sm:flex lg:hidden flex-none w-9 h-9 items-center justify-center rounded-[10px] transition-colors hover:bg-[var(--surface2)]"
              style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--text)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5 flex-none">
            {isStaff && (
              <Link
                href={adminHref}
                title="Admin Panel"
                className="flex-none inline-flex items-center gap-1.5 h-9 px-2.5 lg:px-3 rounded-[10px] text-sm font-semibold no-underline transition-colors hover:bg-[var(--surface2)]"
                style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--text)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}
            <Link href={canSubmit ? `${prefix}/upload` : `${prefix}/community`} title={t("upload")} className="hd-header-upload-btn hd-btn-primary text-sm px-3 py-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V4m0 0 5 5m-5-5L7 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="hidden lg:inline">{t("upload")}</span>
            </Link>
            <LocaleSwitcher locale={locale} />
            <ThemeToggle />
            {session?.user ? (
              <div className="flex items-center gap-2 flex-none">
                <Link href={`${prefix}/shortlist`} title={t("shortlist")}
                  className="relative w-9 h-9 flex items-center justify-center rounded-[10px] transition-colors hover:bg-[var(--surface2)]"
                  style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <ShortlistBadge />
                </Link>
                <Link href={`${prefix}/u/${session.user.name ?? "me"}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "var(--surface2)", border: "2px solid var(--line2)", color: "var(--text2)" }}>
                  {(session.user.name ?? session.user.email ?? "?")[0]?.toUpperCase()}
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href={`${prefix}/login`} className="hd-btn-secondary text-sm px-3 py-2">{t("login")}</Link>
                {canRegister && (
                  <Link href={`${prefix}/signup`} className="hd-btn-primary text-sm px-3 py-2">{t("signup")}</Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-2 ml-auto flex-none">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] transition-colors"
              style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--text)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile search bar — lives inside the sticky wrapper so z-50 covers the hero */}
        <div className="sm:hidden px-4 pb-2.5 border-t" style={{ borderColor: "var(--line)" }}>
          <div className="pt-2 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <HeaderSearch />
            </div>
            {/* Filters trigger — only on browse/listing pages */}
            {showFilterBtn && (
              <button
                type="button"
                aria-label="Open filters"
                onClick={() => window.dispatchEvent(new CustomEvent("hd:open-filters"))}
                className="flex-none w-[44px] h-[44px] flex items-center justify-center rounded-[11px] transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--line2)", color: "var(--text)" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile menu overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100]"
          style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile menu drawer ── */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[110] flex flex-col w-[min(320px,85vw)]"
        style={{
          background: "var(--bg2)",
          borderLeft: "1px solid var(--line2)",
          boxShadow: "-24px 0 64px rgba(0,0,0,.5)",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.26s cubic-bezier(.22,.68,0,1.15)",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 flex-none"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <SiteLogo height={28} className="h-[28px] w-auto" />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface2)]"
            style={{ color: "var(--dim2)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-[14px] py-[13px] rounded-[12px] text-[15px] font-semibold transition-colors no-underline"
                style={item.active
                  ? { background: "rgba(255,46,99,.1)", color: "#ff6a8a", border: "1px solid rgba(255,46,99,.2)" }
                  : { background: "var(--surface)", color: "var(--text2)", border: "1px solid var(--line)" }}
              >
                <span className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-none"
                  style={{ background: item.active ? "rgba(255,46,99,.15)" : "var(--surface2)" }}>
                  <NavIcon d={item.icon} />
                </span>
                {item.label}
              </Link>
            ))}
            {isStaff && (
              <Link href={adminHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-[14px] py-[13px] rounded-[12px] text-[15px] font-semibold transition-colors no-underline"
                style={{ background: "var(--surface)", color: "var(--text2)", border: "1px solid var(--line)" }}
              >
                <span className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-none" style={{ background: "var(--surface2)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </span>
                Admin Panel
              </Link>
            )}
          </div>

          <div style={{ height: 1, background: "var(--line)" }} />

          {/* Upload CTA */}
          <Link href={canSubmit ? `${prefix}/upload` : `${prefix}/community`}
            className="flex items-center justify-center gap-2 w-full rounded-[12px] py-[13px] font-bold text-[15px] text-white no-underline"
            style={{ background: "linear-gradient(135deg,#ff2e63,#ff6a3d)", boxShadow: "0 4px 16px rgba(255,46,99,.35)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4m0 0 5 5m-5-5L7 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t("upload")}
          </Link>

          {/* Auth */}
          {session?.user ? (
            <div className="flex items-center gap-3 px-[14px] py-[13px] rounded-[12px]"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-none"
                style={{ background: "var(--surface2)", border: "2px solid var(--line2)", color: "var(--text2)" }}>
                {(session.user.name ?? session.user.email ?? "?")[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold truncate">{session.user.name ?? "User"}</div>
                <div className="text-[12px] truncate" style={{ color: "var(--dim)" }}>{session.user.email}</div>
              </div>
              <Link href={`${prefix}/shortlist`} title={t("shortlist")}
                className="relative w-9 h-9 flex items-center justify-center rounded-[9px] flex-none"
                style={{ background: "var(--surface2)", color: "var(--text)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-4-7 4V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <ShortlistBadge />
              </Link>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href={`${prefix}/login`} className="flex-1 hd-btn-secondary text-center text-[14px] py-[12px]">
                {t("login")}
              </Link>
              {canRegister && (
                <Link href={`${prefix}/signup`} className="flex-1 hd-btn-primary text-center text-[14px] py-[12px]">
                  {t("signup")}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Drawer footer: locale + theme */}
        <div className="flex items-center justify-between px-5 py-4 flex-none"
          style={{ borderTop: "1px solid var(--line)" }}>
          <LocaleSwitcher locale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
