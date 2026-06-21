import sharp from "sharp";
import { putObject, variantKey, publicUrl } from "./r2";
import { db } from "./db";
import { wallpaperImages, wallpapers, siteConfigs } from "./db/schema";
import { eq, inArray } from "drizzle-orm";

export const ALL_VARIANTS = [
  { name: "8k",  width: 7680, height: 4320 },
  { name: "6k",  width: 6016, height: 3384 },
  { name: "5k",  width: 5120, height: 2880 },
  { name: "4k",  width: 3840, height: 2160 },
  { name: "2k",  width: 2560, height: 1440 },
  { name: "fhd", width: 1920, height: 1080 },
  { name: "hd",  width: 1280, height: 720  },
  { name: "thumb", width: 800, height: 450 },
  { name: "micro", width: 400, height: 225 },
] as const;

export const HOBBY_VARIANTS = ALL_VARIANTS.filter(
  (v) => !["8k", "6k", "5k", "4k", "2k"].includes(v.name)
);

export const FORMATS = ["jpeg", "webp", "avif"] as const;
export const DEFAULT_FORMATS: typeof FORMATS[number][] = ["jpeg"];

export type ImageFormat = (typeof FORMATS)[number];

// ── thumbnail config ───────────────────────────────────────────────────────────

export interface ThumbConfig {
  width: number;
  height: number;
  format: ImageFormat;
}

const DEFAULT_THUMB: ThumbConfig = { width: 800, height: 450, format: "avif" };

export async function getThumbConfig(): Promise<ThumbConfig> {
  const rows = await db
    .select()
    .from(siteConfigs)
    .where(inArray(siteConfigs.param, ["thumb_width", "thumb_height", "thumb_format"]));

  const get = (key: string) => rows.find((r) => r.param === key)?.value ?? null;

  const width = parseInt(get("thumb_width") ?? "", 10);
  const height = parseInt(get("thumb_height") ?? "", 10);
  const format = (get("thumb_format") ?? "avif") as ImageFormat;

  return {
    width: isNaN(width) ? DEFAULT_THUMB.width : width,
    height: isNaN(height) ? DEFAULT_THUMB.height : height,
    format: FORMATS.includes(format as ImageFormat) ? format : DEFAULT_THUMB.format,
  };
}

// ── helpers ────────────────────────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) =>
        Math.round(c)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

export async function extractDominantColors(buffer: Buffer): Promise<string[]> {
  const { dominant } = await sharp(buffer).stats();
  const colors = new Set<string>();
  if (dominant?.r !== undefined) {
    colors.add(rgbToHex(dominant.r, dominant.g, dominant.b));
  }
  const resized = await sharp(buffer)
    .resize(100, 100, { fit: "cover" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = resized;
  const step = Math.max(1, Math.floor((data.length / info.channels) / 20));
  for (let i = 0; i < data.length; i += step * info.channels) {
    colors.add(rgbToHex(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0));
    if (colors.size >= 5) break;
  }
  return Array.from(colors).slice(0, 5);
}

function mimeType(format: ImageFormat): string {
  const map: Record<ImageFormat, string> = {
    jpeg: "image/jpeg",
    webp: "image/webp",
    avif: "image/avif",
  };
  return map[format] ?? "image/jpeg";
}

// ── generate one variant ───────────────────────────────────────────────────────

export async function generateAndStoreVariant(
  wallpaperId: number,
  publicId: string,
  buffer: Buffer,
  width: number,
  height: number,
  format: ImageFormat
): Promise<string> {
  const variantBuffer = await sharp(buffer)
    .resize(width, height, { fit: "cover", withoutEnlargement: true })
    .toFormat(format, { quality: 85 })
    .toBuffer();

  const key = variantKey(publicId, width, height, format);
  await putObject(key, variantBuffer, mimeType(format));

  const url = publicUrl(key);

  await db
    .insert(wallpaperImages)
    .values({ wallpaperId, url, format, width, height, fileSize: variantBuffer.length, status: "active" })
    .onConflictDoNothing();

  return url;
}

// ── process all variants ───────────────────────────────────────────────────────

export async function processWallpaperVariants(
  wallpaperId: number,
  publicId: string,
  buffer: Buffer,
  variants: typeof ALL_VARIANTS | typeof HOBBY_VARIANTS = HOBBY_VARIANTS,
  pending4k = true
): Promise<{ dominantColors: string[]; thumbUrl: string }> {
  const thumbConfig = await getThumbConfig();
  const dominantColors = await extractDominantColors(buffer);
  let thumbUrl = "";

  await Promise.all(
    variants.flatMap(({ width, height }) =>
      // Always generate jpeg as the base download format + the configured thumb format for thumbnails
      Array.from(new Set<ImageFormat>(["jpeg", thumbConfig.format])).map(async (format) => {
        const variantBuffer = await sharp(buffer)
          .resize(width, height, { fit: "cover", withoutEnlargement: true })
          .toFormat(format, { quality: 85 })
          .toBuffer();

        const key = variantKey(publicId, width, height, format);
        await putObject(key, variantBuffer, mimeType(format));

        const url = publicUrl(key);

        // Use thumb config dimensions + format for the thumbnail URL
        if (width === thumbConfig.width && height === thumbConfig.height && format === thumbConfig.format) {
          thumbUrl = url;
        }
        // Fallback: if thumb config dims match but format differs, also accept webp
        if (!thumbUrl && width === thumbConfig.width && height === thumbConfig.height && format === "jpeg") {
          thumbUrl = url;
        }

        await db.insert(wallpaperImages).values({
          wallpaperId,
          url,
          format,
          width,
          height,
          fileSize: variantBuffer.length,
          status: "active",
        });
      })
    )
  );

  await db
    .update(wallpapers)
    .set({
      dominantColors,
      thumbUrl: thumbUrl || undefined,
      processingPending4k: pending4k,
    })
    .where(eq(wallpapers.id, wallpaperId));

  return { dominantColors, thumbUrl };
}

export async function backfill4kVariants(
  wallpaperId: number,
  publicId: string,
  buffer: Buffer
): Promise<void> {
  const thumbConfig = await getThumbConfig();
  const variants = ALL_VARIANTS.filter((v) => ["4k", "2k"].includes(v.name));

  await Promise.all(
    variants.flatMap(({ width, height }) =>
      Array.from(new Set<ImageFormat>(["jpeg", thumbConfig.format])).map(async (format) => {
        const variantBuffer = await sharp(buffer)
          .resize(width, height, { fit: "cover", withoutEnlargement: true })
          .toFormat(format, { quality: 85 })
          .toBuffer();

        const key = variantKey(publicId, width, height, format);
        await putObject(key, variantBuffer, mimeType(format));

        await db.insert(wallpaperImages).values({
          wallpaperId,
          url: publicUrl(key),
          format,
          width,
          height,
          fileSize: variantBuffer.length,
          status: "active",
        });
      })
    )
  );

  await db
    .update(wallpapers)
    .set({ processingPending4k: false })
    .where(eq(wallpapers.id, wallpaperId));
}
