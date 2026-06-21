import { resolveMediaUrl } from "./media";
import { variantKey } from "./r2";

export function wallpaperDownloadPath(
  uuid: string,
  params?: { width?: number; format?: string }
): string {
  const search = new URLSearchParams();
  if (params?.width) search.set("width", String(params.width));
  if (params?.format) search.set("format", params.format);
  const qs = search.toString();
  return `/api/download/${uuid}${qs ? `?${qs}` : ""}`;
}

export function wallpaperVariantUrl(
  uuid: string,
  width: number,
  height: number,
  format: string
): string {
  return resolveMediaUrl(variantKey(uuid, width, height, format));
}
