import { CDN_URL } from "./routing";

/** CDN URLs are used by default. Enable proxy only when CDN is unavailable. */
export function isMediaProxyEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MEDIA_PROXY === "true";
}

export function extractMediaKey(urlOrKey: string): string {
  if (!urlOrKey) return "";

  if (urlOrKey.startsWith("originals/") || urlOrKey.startsWith("variants/")) {
    return urlOrKey;
  }

  if (urlOrKey.startsWith("/api/media/")) {
    return urlOrKey.slice("/api/media/".length);
  }

  try {
    const parsed = new URL(urlOrKey);
    return parsed.pathname.replace(/^\//, "");
  } catch {
    return urlOrKey.replace(/^\//, "");
  }
}

export function resolveMediaUrl(urlOrKey: string): string {
  if (!urlOrKey) return "";

  const key = extractMediaKey(urlOrKey);
  if (!key) return urlOrKey;

  if (isMediaProxyEnabled()) {
    return `/api/media/${key}`;
  }

  return `${CDN_URL}/${key}`;
}

export function resolveMediaUrls<T extends { thumbUrl: string }>(item: T): T {
  return {
    ...item,
    thumbUrl: resolveMediaUrl(item.thumbUrl),
  };
}
