import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { challenges } from "@/lib/db/schema";

const patchSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().min(1).optional(),
  accentColor: z.string().max(20).optional(),
  prize: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const challengeId = parseInt(id, 10);
    const body = patchSchema.parse(await req.json());

    const patch: Partial<typeof challenges.$inferInsert> = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.description !== undefined) patch.description = body.description;
    if (body.accentColor !== undefined) patch.accentColor = body.accentColor;
    if (body.prize !== undefined) patch.prize = body.prize;
    if (body.deadline !== undefined) {
      patch.deadline = body.deadline ? new Date(body.deadline) : null;
    }
    if (body.active !== undefined) patch.active = body.active;

    const [row] = await db
      .update(challenges)
      .set(patch)
      .where(eq(challenges.id, challengeId))
      .returning();

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ challenge: row });
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
    const challengeId = parseInt(id, 10);
    await db.delete(challenges).where(eq(challenges.id, challengeId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = message === "Unauthorized" || message === "Forbidden" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
