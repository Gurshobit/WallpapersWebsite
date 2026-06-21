import "dotenv/config";
import { randomUUID } from "crypto";
import { CopyObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { eq, sql } from "drizzle-orm";
import { db } from "../lib/db";
import { wallpapers, wallpaperImages } from "../lib/db/schema";
import { r2, R2_BUCKET, originalKey, variantKey, publicUrl } from "../lib/r2";
import { ensureWallpaperUuidColumn } from "./migrate-add-wallpaper-uuid";

const NUMERIC_KEY = /^((?:originals|variants)\/)(\d+)(\/.*)$/;

async function copyPrefix(oldPrefix: string, newPrefix: string) {
  let token: string | undefined;
  let copied = 0;

  do {
    const listing = await r2.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        Prefix: oldPrefix,
        ContinuationToken: token,
      })
    );

    for (const obj of listing.Contents ?? []) {
      if (!obj.Key) continue;
      const destKey = obj.Key.replace(oldPrefix, newPrefix);
      await r2.send(
        new CopyObjectCommand({
          Bucket: R2_BUCKET,
          CopySource: `${R2_BUCKET}/${obj.Key}`,
          Key: destKey,
          MetadataDirective: "REPLACE",
          CacheControl: "public, max-age=31536000, immutable",
        })
      );
      copied++;
    }

    token = listing.NextContinuationToken;
  } while (token);

  return copied;
}

function rewriteStoredUrl(url: string, oldPublicId: string, newPublicId: string) {
  return url
    .replace(`originals/${oldPublicId}/`, `originals/${newPublicId}/`)
    .replace(`variants/${oldPublicId}/`, `variants/${newPublicId}/`);
}

async function migrateWallpaperStorage(
  numericId: string,
  publicId: string,
  ext: string
) {
  const oldOriginalPrefix = `originals/${numericId}/`;
  const newOriginalPrefix = `originals/${publicId}/`;
  const oldVariantPrefix = `variants/${numericId}/`;
  const newVariantPrefix = `variants/${publicId}/`;

  await copyPrefix(oldOriginalPrefix, newOriginalPrefix);
  await copyPrefix(oldVariantPrefix, newVariantPrefix);

  return {
    originalKey: originalKey(publicId, ext),
    thumbUrl: publicUrl(variantKey(publicId, 800, 450, "webp")),
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  await ensureWallpaperUuidColumn();

  const rows = await db.select().from(wallpapers);
  console.log(`Checking ${rows.length} wallpapers...`);

  for (const wall of rows) {
    const publicId = wall.uuid || randomUUID();

    if (!wall.uuid) {
      await db
        .update(wallpapers)
        .set({ uuid: publicId })
        .where(eq(wallpapers.id, wall.id));
      console.log(`Assigned uuid ${publicId} to wallpaper #${wall.id}`);
    }

    const keyMatch = wall.originalKey?.match(NUMERIC_KEY);
    if (!keyMatch) continue;

    const numericId = keyMatch[2];
    if (numericId === publicId) continue;

    const ext = wall.originalKey!.split(".").pop() ?? "jpeg";
    console.log(`Migrating storage ${numericId} -> ${publicId} for wallpaper #${wall.id}`);

    const migrated = await migrateWallpaperStorage(numericId, publicId, ext);

    await db
      .update(wallpapers)
      .set({
        originalKey: migrated.originalKey,
        originalUrl: migrated.originalKey,
        thumbUrl: migrated.thumbUrl,
      })
      .where(eq(wallpapers.id, wall.id));

    const images = await db
      .select()
      .from(wallpaperImages)
      .where(eq(wallpaperImages.wallpaperId, wall.id));

    for (const image of images) {
      await db
        .update(wallpaperImages)
        .set({
          url: rewriteStoredUrl(image.url, numericId, publicId),
        })
        .where(eq(wallpaperImages.id, image.id));
    }

    console.log(`  Updated ${images.length} variant records`);
  }

  const missingUuid = await db
    .select({ count: sql<number>`count(*)` })
    .from(wallpapers)
    .where(sql`${wallpapers.uuid} IS NULL`);

  if (Number(missingUuid[0]?.count ?? 0) > 0) {
    throw new Error("Some wallpapers still missing uuid");
  }

  console.log("Backfill complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
