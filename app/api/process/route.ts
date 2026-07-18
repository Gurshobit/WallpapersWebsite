import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  wallpapers,
  moderationQueue,
  challengeEntries,
  challenges,
} from "@/lib/db/schema";
import { getObjectBuffer } from "@/lib/r2";
import { processWallpaperVariants, ALL_VARIANTS } from "@/lib/sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { wallpaperId, challengeId } = await req.json();
    if (!wallpaperId) {
      return NextResponse.json({ error: "wallpaperId required" }, { status: 400 });
    }

    const [wallpaper] = await db
      .select()
      .from(wallpapers)
      .where(eq(wallpapers.id, wallpaperId))
      .limit(1);

    if (!wallpaper?.originalKey) {
      return NextResponse.json({ error: "Wallpaper not found" }, { status: 404 });
    }

    const buffer = await getObjectBuffer(wallpaper.originalKey);

    const isPro = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
    const variants = isPro ? ALL_VARIANTS : undefined;
    const pending4k = !isPro;

    const { thumbUrl } = await processWallpaperVariants(
      wallpaperId,
      wallpaper.uuid,
      buffer,
      variants,
      pending4k
    );

    const requiresModeration = process.env.REQUIRE_MODERATION !== "false";
    const status = requiresModeration ? "pending" : "active";

    await db
      .update(wallpapers)
      .set({
        status,
        thumbUrl: thumbUrl || wallpaper.thumbUrl,
        originalUrl: wallpaper.originalKey,
      })
      .where(eq(wallpapers.id, wallpaperId));

    if (requiresModeration) {
      await db.insert(moderationQueue).values({
        wallpaperId,
        status: "pending",
      });
    }

    if (challengeId && wallpaper.userId) {
      const [challenge] = await db
        .select({ id: challenges.id, active: challenges.active })
        .from(challenges)
        .where(and(eq(challenges.id, challengeId), eq(challenges.active, true)))
        .limit(1);

      if (challenge) {
        const [existing] = await db
          .select({ id: challengeEntries.id })
          .from(challengeEntries)
          .where(
            and(
              eq(challengeEntries.challengeId, challengeId),
              eq(challengeEntries.wallpaperId, wallpaperId)
            )
          )
          .limit(1);

        if (!existing) {
          await db.insert(challengeEntries).values({
            challengeId,
            wallpaperId,
            userId: wallpaper.userId,
          });
          await db
            .update(challenges)
            .set({ entryCount: sql`${challenges.entryCount} + 1` })
            .where(eq(challenges.id, challengeId));
        }
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("Process error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 }
    );
  }
}
