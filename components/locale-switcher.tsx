"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES } from "@/lib/routing";

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  fr: "Français",
  ja: "日本語",
  ar: "العربية",
};

export function LocaleSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function hrefFor(nextLocale: string) {
    const stripped = pathname.replace(/^\/(en|hi|es|pt|de|fr|ja|ar)(?=\/|$)/, "");
    if (nextLocale === "en") return stripped || "/";
    return `/${nextLocale}${stripped || ""}`;
  }

  function switchLocale(nextLocale: string) {
    // Update NEXT_LOCALE cookie so next-intl middleware respects the choice
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.push(hrefFor(nextLocale));
  }

  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-[11px] px-3 py-[7px] text-[12.5px] font-bold whitespace-nowrap cursor-pointer"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--muted)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M3 12h18"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        {locale.toUpperCase()}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div
        className="absolute right-0 top-[calc(100%+6px)] min-w-[148px] rounded-[13px] border py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
        style={{
          background: "var(--surface)",
          borderColor: "var(--line)",
          boxShadow: "0 12px 36px rgba(0,0,0,.32)",
        }}
      >
        {LOCALES.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            className="w-full flex items-center gap-2.5 px-3.5 py-[9px] text-[13px] font-semibold text-left border-none cursor-pointer transition-colors hover:bg-[var(--surface2)]"
            style={{
              background: "transparent",
              color: loc === locale ? "#ff2e63" : "var(--text2)",
            }}
          >
            {loc === locale && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M20 6 9 17l-5-5" stroke="#ff2e63" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
            {loc !== locale && <span className="w-3" />}
            <span className="flex-1">{LOCALE_NAMES[loc] ?? loc.toUpperCase()}</span>
            <span className="text-[11px] font-bold opacity-40">{loc.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
