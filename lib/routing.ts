export const LOCALES = ["en", "hi", "es", "pt", "de", "fr", "ja", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const routing = {
  locales: LOCALES,
  defaultLocale: "en" as Locale,
  localePrefix: "as-needed" as const,
};

export const GEO_MAP: Record<string, Locale> = {
  IN: "hi",
  BR: "pt",
  MX: "es",
  ES: "es",
  DE: "de",
  FR: "fr",
  JP: "ja",
  SA: "ar",
  AE: "ar",
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hdwallpapers.site";

export const CDN_URL =
  process.env.NEXT_PUBLIC_CDN_URL ??
  process.env.R2_PUBLIC_URL ??
  "";

export const PAGE_SIZE = 12;
export const PAGE_SIZES = [12, 24, 48] as const;

export function parsePageSize(value: string | undefined): number {
  const n = parseInt(value ?? "", 10);
  return PAGE_SIZES.includes(n as (typeof PAGE_SIZES)[number]) ? n : PAGE_SIZE;
}
