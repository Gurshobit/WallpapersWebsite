import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  wallpapers,
  wallpaperCategories,
  wallpaperTags,
  tags,
} from "@/lib/db/schema";
import { presignPut, originalKey } from "@/lib/r2";
import { requireAuth } from "@/lib/session";
import { assertCanSubmit } from "@/lib/member-settings";

const schema = z.object({
  filename: z.string(),
  contentType: z.string(),
  size: z.number().max(50 * 1024 * 1024),
  title: z.string().min(1),
  description: z.string().optional(),
  categoryIds: z.array(z.number()).min(1),
  tagNames: z.array(z.string().trim().min(1)).optional().default([]),
  licenseId: z.number(),
});

function slugifyTag(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

async function resolveTagIds(tagNames: string[]) {
  const uniqueNames = [...new Set(tagNames.map((n) => n.trim()).filter(Boolean))];
  const tagIds: number[] = [];

  for (const name of uniqueNames) {
    const slug = slugifyTag(name);
    const [existing] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existing) {
      tagIds.push(existing.id);
      continue;
    }

    const [created] = await db
      .insert(tags)
      .values({ name, slug })
      .returning({ id: tags.id });

    tagIds.push(created.id);
  }

  return { tagIds, uniqueNames };
}

export async function POST(req: NextRequest) {
  try {
    await assertCanSubmit();
    const user = await requireAuth();
    const body = schema.parse(await req.json());

    const ext = body.filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 200);

    const categoryIds = [...new Set(body.categoryIds)];

    const { tagIds, uniqueNames } = await resolveTagIds(body.tagNames);

    const [wallpaper] = await db
      .insert(wallpapers)
      .values({
        userId: user.id,
        categoryId: categoryIds[0],
        licenseId: body.licenseId,
        slug: `${slug}-${Date.now()}`,
        title: body.title,
        description: body.description,
        tags: uniqueNames.length > 0 ? uniqueNames.join(", ") : undefined,
        status: "draft",
        thumbUrl: "",
      })
      .returning();

    await db.insert(wallpaperCategories).values(
      categoryIds.map((categoryId) => ({
        wallpaperId: wallpaper.id,
        categoryId,
      }))
    );

    if (tagIds.length > 0) {
      await db.insert(wallpaperTags).values(
        tagIds.map((tagId) => ({
          wallpaperId: wallpaper.id,
          tagId,
        }))
      );
    }

    const key = originalKey(wallpaper.uuid, ext);
    const uploadUrl = await presignPut(key, body.contentType);

    await db
      .update(wallpapers)
      .set({ originalKey: key })
      .where(eq(wallpapers.id, wallpaper.id));

    return NextResponse.json({
      uploadUrl,
      wallpaperId: wallpaper.id,
      wallpaperUuid: wallpaper.uuid,
      key,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload init failed";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("disabled")
          ? 403
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
