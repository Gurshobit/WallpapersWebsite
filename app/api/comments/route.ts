import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { wallpaperComments, wallpapers } from "@/lib/db/schema";
import { assertCanComment, getMemberSettings } from "@/lib/member-settings";
import { requireAuth } from "@/lib/session";

const schema = z.object({
  wallpaperId: z.number().int().positive(),
  message: z.string().trim().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    await assertCanComment();
    const user = await requireAuth();
    const body = schema.parse(await req.json());

    const [wallpaper] = await db
      .select({ id: wallpapers.id })
      .from(wallpapers)
      .where(eq(wallpapers.id, body.wallpaperId))
      .limit(1);

    if (!wallpaper) {
      return NextResponse.json({ error: "Wallpaper not found" }, { status: 404 });
    }

    const settings = await getMemberSettings();
    const status = settings.moderateComments ? "pending" : "active";

    const [comment] = await db
      .insert(wallpaperComments)
      .values({
        userId: user.id,
        wallpaperId: body.wallpaperId,
        message: body.message,
        status,
      })
      .returning({
        id: wallpaperComments.id,
        status: wallpaperComments.status,
      });

    return NextResponse.json({
      ok: true,
      comment,
      pending: status === "pending",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to post comment";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("disabled")
          ? 403
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
