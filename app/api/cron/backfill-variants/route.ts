import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wallpapers } from "@/lib/db/schema";
import { getObjectBuffer } from "@/lib/r2";
import { backfill4kVariants } from "@/lib/sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

function verifyCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed when no secret is configured
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pending = await db
      .select()
      .from(wallpapers)
      .where(eq(wallpapers.processingPending4k, true))
      .limit(3);

    let processed = 0;
    for (const wall of pending) {
      if (!wall.originalKey) continue;
      const buffer = await getObjectBuffer(wall.originalKey);
      await backfill4kVariants(wall.id, wall.uuid, buffer);
      processed++;
    }

    return NextResponse.json({ success: true, processed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Backfill failed" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
