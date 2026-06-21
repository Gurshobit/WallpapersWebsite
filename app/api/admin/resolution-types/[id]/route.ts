import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { resolutionTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
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
      .update(resolutionTypes)
      .set(body)
      .where(eq(resolutionTypes.id, parseInt(id)))
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
    await db.delete(resolutionTypes).where(eq(resolutionTypes.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
