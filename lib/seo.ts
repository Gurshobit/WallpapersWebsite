import type { Metadata } from "next";
import { LOCALES, SITE_URL, type Locale } from "./routing";

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  locale?: Locale;
  ogImage?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  locale = "en",
  ogImage,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const canonicalPath = locale === "en" ? path : `/${locale}${path}`;
  const languages = Object.fromEntries(
    LOCALES.map((l) => [
      l,
      `${SITE_URL}${l === "en" ? path : `/${l}${path}`}`,
    ])
  );

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: "HDWallpapers.site",
      locale,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 1280, height: 720 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function wallpaperJsonLd(wall: {
  title: string;
  description?: string | null;
  contentUrl: string;
  width?: number | null;
  height?: number | null;
  authorName?: string | null;
  licenseUrl?: string | null;
  tags?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: wall.title,
    description: wall.description ?? wall.title,
    contentUrl: wall.contentUrl,
    width: wall.width ?? 1920,
    height: wall.height ?? 1080,
    ...(wall.authorName
      ? { author: { "@type": "Person", name: wall.authorName } }
      : {}),
    ...(wall.licenseUrl ? { license: wall.licenseUrl } : {}),
    ...(wall.tags ? { keywords: wall.tags } : {}),
  };
}
