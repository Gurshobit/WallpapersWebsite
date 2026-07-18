import { resolveMediaUrl } from "@/lib/media";
import { wallpaperVariantUrl } from "@/lib/wallpaper-urls";

export function collectionThumbSrc(src: string): string {
  if (!src) return "";
  if (src.includes("/") || src.startsWith("http")) return resolveMediaUrl(src);
  return wallpaperVariantUrl(src, 240, 135, "webp");
}

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  const m = Math.floor((Date.now() - value.getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return value.toLocaleDateString();
}
