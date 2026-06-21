import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { resolutions, resolutionTypes, wallpapers, wallpaperImages } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get("uuid");

  const [types, res] = await Promise.all([
    db.select().from(resolutionTypes).orderBy(asc(resolutionTypes.sortOrder), asc(resolutionTypes.id)),
    db.select().from(resolutions).orderBy(asc(resolutions.typeId), asc(resolutions.sortOrder), asc(resolutions.id)),
  ]);

  // When a wallpaper UUID is provided, restrict to resolutions that have an actual
  // variant image stored for that wallpaper (match on width + height).
  let availableDimensions: Set<string> | null = null;

  if (uuid) {
    const [wallpaper] = await db
      .select({ id: wallpapers.id })
      .from(wallpapers)
      .where(eq(wallpapers.uuid, uuid))
      .limit(1);

    if (wallpaper) {
      const images = await db
        .select({ width: wallpaperImages.width, height: wallpaperImages.height })
        .from(wallpaperImages)
        .where(eq(wallpaperImages.wallpaperId, wallpaper.id));

      availableDimensions = new Set(images.map((img) => `${img.width}x${img.height}`));
    }
  }

  const groups = types
    .map((t) => ({
      type: { id: t.id, name: t.name },
      resolutions: res
        .filter((r) => {
          if (r.typeId !== t.id) return false;
          if (availableDimensions && r.width && r.height) {
            return availableDimensions.has(`${r.width}x${r.height}`);
          }
          return true;
        })
        .map((r) => ({
          id: r.id,
          name: r.name,
          width: r.width,
          height: r.height,
          slug: r.slug,
          showInSidebar: r.showInSidebar,
        })),
    }))
    .filter((g) => g.resolutions.length > 0);

  return NextResponse.json({ groups });
}
