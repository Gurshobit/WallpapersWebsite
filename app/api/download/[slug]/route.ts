import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { wallpapers, wallpaperImages, downloads, topDownloads } from "@/lib/db/schema";
import { presignDownload, getObjectBuffer } from "@/lib/r2";
import { resolveMediaUrl, extractMediaKey } from "@/lib/media";
import { verifyDownload } from "@/lib/download-token";
import { generateAndStoreVariant, type ImageFormat } from "@/lib/sharp";
import { getSession } from "@/lib/session";
import { getUserByAuthId } from "@/lib/db/queries/users";

export const maxDuration = 60;

// ── slug parsing ───────────────────────────────────────────────────────────────

/**
 * Supported slug formats:
 *
 *  Secure (new):  {uuid}-{width}x{height}.{format}?t={token}
 *  Secure (orig): {uuid}.{format}?t={token}
 *  Legacy:        {uuid}   (backward-compatible, no token required)
 */

const UUID_PAT =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const WITH_RES_RE = new RegExp(
  `^(${UUID_PAT})-(\\d+)x(\\d+)\\.([a-z0-9]+)$`,
  "i"
);
const NO_RES_RE = new RegExp(`^(${UUID_PAT})\\.([a-z0-9]+)$`, "i");
const LEGACY_RE = new RegExp(`^(${UUID_PAT})$`, "i");

type ParsedSlug = {
  uuid: string;
  width: number | null;
  height: number | null;
  format: string;
  isLegacy: boolean;
};

function parseSlug(slug: string): ParsedSlug | null {
  let m = slug.match(WITH_RES_RE);
  if (m) {
    return {
      uuid: m[1],
      width: parseInt(m[2], 10),
      height: parseInt(m[3], 10),
      format: m[4],
      isLegacy: false,
    };
  }
  m = slug.match(NO_RES_RE);
  if (m) {
    return { uuid: m[1], width: null, height: null, format: m[2], isLegacy: false };
  }
  m = slug.match(LEGACY_RE);
  if (m) {
    return { uuid: m[1], width: null, height: null, format: "webp", isLegacy: true };
  }
  return null;
}

// ── handler ────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = req.nextUrl;

  const parsed = parseSlug(slug);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid download path" }, { status: 400 });
  }

  const { uuid, width, height, format, isLegacy } = parsed;

  // ── token verification (skip for legacy UUID-only links) ──────────────────
  if (!isLegacy) {
    const token = searchParams.get("t");
    if (!token || !verifyDownload(uuid, width, format, token)) {
      return NextResponse.json(
        { error: "Invalid or expired download token" },
        { status: 403 }
      );
    }
  }

  // Honour legacy ?width= and ?format= query params
  const legacyWidth = isLegacy
    ? searchParams.get("width")
      ? parseInt(searchParams.get("width")!, 10)
      : null
    : null;
  const legacyFormat = isLegacy ? searchParams.get("format") ?? format : format;
  const resolvedWidth = width ?? legacyWidth;
  const resolvedFormat = legacyFormat;

  // ── wallpaper lookup ──────────────────────────────────────────────────────
  const [wallpaper] = await db
    .select()
    .from(wallpapers)
    .where(eq(wallpapers.uuid, uuid))
    .limit(1);

  if (!wallpaper) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ── resolve R2 object key ─────────────────────────────────────────────────
  let r2Key: string | null = null;

  if (resolvedWidth) {
    const [image] = await db
      .select()
      .from(wallpaperImages)
      .where(
        and(
          eq(wallpaperImages.wallpaperId, wallpaper.id),
          eq(wallpaperImages.width, resolvedWidth),
          eq(wallpaperImages.format, resolvedFormat)
        )
      )
      .limit(1);
    if (image) r2Key = image.url;
  } else {
    const [image] = await db
      .select()
      .from(wallpaperImages)
      .where(
        and(
          eq(wallpaperImages.wallpaperId, wallpaper.id),
          eq(wallpaperImages.format, resolvedFormat)
        )
      )
      .orderBy(desc(wallpaperImages.width))
      .limit(1);
    if (image) r2Key = image.url;
  }

  if (!r2Key) r2Key = wallpaper.originalKey ?? wallpaper.thumbUrl;

  // ── on-demand variant generation ──────────────────────────────────────────
  // If the requested format variant doesn't exist yet, generate it from the
  // original and save it to R2 + DB before serving.
  const VALID_FORMATS: ImageFormat[] = ["jpeg", "webp", "avif"];
  if (
    !r2Key &&
    wallpaper.originalKey &&
    VALID_FORMATS.includes(resolvedFormat as ImageFormat)
  ) {
    try {
      const originalBuffer = await getObjectBuffer(extractMediaKey(wallpaper.originalKey));
      const genWidth = resolvedWidth ?? wallpaper.width ?? 1920;
      const genHeight = height ?? wallpaper.height ?? 1080;
      r2Key = await generateAndStoreVariant(
        wallpaper.id,
        wallpaper.uuid,
        originalBuffer,
        genWidth,
        genHeight,
        resolvedFormat as ImageFormat
      );
    } catch {
      // Generation failed — fall back to any available variant
    }
  } else if (r2Key && wallpaper.originalKey) {
    // Check if the stored key points to a different format than requested
    const storedFormat = r2Key.split(".").pop();
    if (
      !isLegacy &&
      storedFormat !== resolvedFormat &&
      VALID_FORMATS.includes(resolvedFormat as ImageFormat) &&
      resolvedWidth
    ) {
      try {
        const originalBuffer = await getObjectBuffer(extractMediaKey(wallpaper.originalKey));
        const genHeight = height ?? wallpaper.height ?? 1080;
        r2Key = await generateAndStoreVariant(
          wallpaper.id,
          wallpaper.uuid,
          originalBuffer,
          resolvedWidth,
          genHeight,
          resolvedFormat as ImageFormat
        );
      } catch {
        // Keep original r2Key as fallback
      }
    }
  }

  // ── record download + increment topDownloads ─────────────────────────────
  const session = await getSession();
  const user = session?.user?.id
    ? await getUserByAuthId(session.user.id)
    : null;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  // Insert raw event (fire-and-forget)
  db.insert(downloads)
    .values({ wallpaperId: wallpaper.id, userId: user?.id, ipHash, format: resolvedFormat })
    .catch(() => {});

  // Immediately upsert denormalised counters so the UI reflects the download
  db.execute(sql`
    INSERT INTO ${topDownloads}
      (wallpaper_id, "all", today, last_7_days, last_30_days, this_month, last_month)
    VALUES (${wallpaper.id}, 1, 1, 1, 1, 1, 0)
    ON CONFLICT (wallpaper_id) DO UPDATE SET
      "all"        = ${topDownloads}.all + 1,
      today        = ${topDownloads}.today + 1,
      last_7_days  = ${topDownloads}.last_7_days + 1,
      last_30_days = ${topDownloads}.last_30_days + 1,
      this_month   = ${topDownloads}.this_month + 1
  `).catch(() => {});

  // ── build presigned URL via custom domain ─────────────────────────────────
  // image.url may be a full CDN URL — extract the bare R2 object key first
  const objectKey = extractMediaKey(r2Key);

  const baseSlug = wallpaper.slug ?? uuid.slice(0, 8);
  const dimSuffix = resolvedWidth ? `-${resolvedWidth}x${height ?? ""}` : "";
  const downloadFilename = `${baseSlug}${dimSuffix}.${resolvedFormat}`;

  try {
    // presignDownload signs with Content-Disposition:attachment and rewrites
    // the hostname to static.hdwallpapers.site — bucket URL never exposed,
    // file transfer goes R2 → User directly (zero Vercel bandwidth cost).
    const signedUrl = await presignDownload(objectKey, downloadFilename, 3600);
    return NextResponse.redirect(signedUrl, 307);
  } catch {
    // Fallback for local dev without R2 credentials
    return NextResponse.redirect(resolveMediaUrl(r2Key), 307);
  }
}
