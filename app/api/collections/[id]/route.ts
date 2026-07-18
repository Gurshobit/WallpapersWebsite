import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteCollection,
  updateCollection,
} from "@/lib/db/queries/collections";
import { requireAuth } from "@/lib/session";

const patchSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const collectionId = parseInt(id, 10);
    if (Number.isNaN(collectionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = patchSchema.parse(await req.json());
    const row = await updateCollection(collectionId, body, {
      requireOwnerId: user.id,
    });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ collection: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const collectionId = parseInt(id, 10);
    if (Number.isNaN(collectionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const ok = await deleteCollection(collectionId, {
      requireOwnerId: user.id,
    });
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
