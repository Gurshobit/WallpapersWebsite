import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { resolutions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const patchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  typeId: z.number().int().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  showInSidebar: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = patchSchema.parse(await req.json());
    const [updated] = await db
      .update(resolutions)
      .set(body)
      .where(eq(resolutions.id, parseInt(id)))
      .returning();
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.delete(resolutions).where(eq(resolutions.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
