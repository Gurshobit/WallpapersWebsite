import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  deleteCollection,
  updateCollection,
} from "@/lib/db/queries/collections";

const patchSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  featured: z.boolean().optional(),
  status: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const collectionId = parseInt(id, 10);
    const body = patchSchema.parse(await req.json());
    const row = await updateCollection(collectionId, body, { admin: true });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ collection: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = message === "Unauthorized" || message === "Forbidden" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const collectionId = parseInt(id, 10);
    const ok = await deleteCollection(collectionId, { admin: true });
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = message === "Unauthorized" || message === "Forbidden" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
