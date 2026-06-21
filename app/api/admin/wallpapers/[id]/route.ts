import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  getAdminWallpaperDetail,
  updateAdminWallpaper,
} from "@/lib/db/queries/admin";
import { resolveMediaUrl } from "@/lib/media";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const wallpaperId = parseInt(id, 10);
    if (Number.isNaN(wallpaperId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const data = await getAdminWallpaperDetail(wallpaperId);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...data,
      wallpaper: {
        ...data.wallpaper,
        thumbUrl: data.wallpaper.thumbUrl
          ? resolveMediaUrl(data.wallpaper.thumbUrl)
          : "",
      },
      images: data.images.map((img) => ({
        ...img,
        url: resolveMediaUrl(img.url),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status =
      message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

const patchSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: z
    .enum(["active", "pending", "rejected", "disabled", "draft", "delete"])
    .optional(),
  featured: z.boolean().optional(),
  categoryId: z.number().int().positive().optional(),
  tags: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const wallpaperId = parseInt(id, 10);
    if (Number.isNaN(wallpaperId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = patchSchema.parse(await req.json());
    const updated = await updateAdminWallpaper(wallpaperId, body);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ wallpaper: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status =
      message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
