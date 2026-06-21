import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { eq, and, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { wallpapers, views, topPopular } from "@/lib/db/schema";
import { getSession } from "@/lib/session";
import { getUserByAuthId } from "@/lib/db/queries/users";

export const dynamic = "force-dynamic";

const schema = z.object({
  wallpaperSlug: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    const [wallpaper] = await db
      .select({ id: wallpapers.id })
      .from(wallpapers)
      .where(eq(wallpapers.slug, body.wallpaperSlug))
      .limit(1);

    if (!wallpaper) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex");

    const session = await getSession();
    const user = session?.user?.id
      ? await getUserByAuthId(session.user.id)
      : null;

    // De-duplicate: skip if this IP already viewed in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [existing] = await db
      .select({ id: views.id })
      .from(views)
      .where(
        and(
          eq(views.wallpaperId, wallpaper.id),
          eq(views.ipHash, ipHash),
          gte(views.dateViewed, oneHourAgo)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ counted: false });
    }

    // Record the view
    await db.insert(views).values({
      wallpaperId: wallpaper.id,
      userId: user?.id ?? null,
      ipHash,
    });

    // Immediately increment topPopular (upsert with +1 increments)
    await db.execute(sql`
      INSERT INTO ${topPopular} (wallpaper_id, "all", today, last_7_days, last_30_days)
      VALUES (${wallpaper.id}, 1, 1, 1, 1)
      ON CONFLICT (wallpaper_id) DO UPDATE SET
        "all"        = ${topPopular}.all + 1,
        today        = ${topPopular}.today + 1,
        last_7_days  = ${topPopular}.last_7_days + 1,
        last_30_days = ${topPopular}.last_30_days + 1
    `);

    return NextResponse.json({ counted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
