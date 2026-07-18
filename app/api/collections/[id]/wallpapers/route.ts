import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  addWallpaperToCollection,
  removeWallpaperFromCollection,
} from "@/lib/db/queries/collections";
import { requireAuth } from "@/lib/session";

const schema = z.object({
  wallpaperId: z.number().int().positive(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const collectionId = parseInt(id, 10);
    const body = schema.parse(await req.json());
    const result = await addWallpaperToCollection(
      collectionId,
      body.wallpaperId,
      user.id
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const collectionId = parseInt(id, 10);
    const body = schema.parse(await req.json());
    const result = await removeWallpaperFromCollection(
      collectionId,
      body.wallpaperId,
      user.id
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
