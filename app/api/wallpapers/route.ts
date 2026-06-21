import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { wallpapers } from "@/lib/db/schema";
import { listWallpapers } from "@/lib/db/queries/wallpapers";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const sort = (searchParams.get("sort") as "latest" | "popular" | "downloads") ?? "latest";

  const result = await listWallpapers({ page, sort });
  return NextResponse.json(result);
}

const createSchema = z.object({
  title: z.string().min(1),
  categoryId: z.number(),
  licenseId: z.number(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { requireAuth } = await import("@/lib/session");
    const user = await requireAuth();
    const body = createSchema.parse(await req.json());

    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 200);

    const [wallpaper] = await db
      .insert(wallpapers)
      .values({
        userId: user.id,
        categoryId: body.categoryId,
        licenseId: body.licenseId,
        slug: `${slug}-${Date.now()}`,
        title: body.title,
        description: body.description,
        tags: body.tags,
        status: "draft",
        thumbUrl: "",
      })
      .returning();

    return NextResponse.json(wallpaper, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
