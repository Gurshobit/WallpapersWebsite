import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";
import { jsonError } from "@/lib/api-response";

const schema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z.string().min(1).max(500).regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().optional(),
  metaTitle: z.string().max(500).optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  status: z.enum(["published", "draft"]).optional(),
  showInFooter: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [row] = await db.select().from(pages).where(eq(pages.id, idNum)).limit(1);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());
    const [row] = await db
      .update(pages)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(pages.id, idNum))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    await requireAdmin();
    await db.delete(pages).where(eq(pages.id, idNum));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
