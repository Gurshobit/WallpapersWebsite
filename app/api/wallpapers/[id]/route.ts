import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { wallpapers } from "@/lib/db/schema";
import { requireAuth, requireAdmin } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const wallpaperId = parseInt(id, 10);

  const [wall] = await db
    .select()
    .from(wallpapers)
    .where(eq(wallpapers.id, wallpaperId))
    .limit(1);

  if (!wall) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(wall);
}

const patchSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "pending", "rejected", "disabled", "draft"]).optional(),
  featured: z.boolean().optional(),
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
      .update(wallpapers)
      .set(body)
      .where(eq(wallpapers.id, parseInt(id, 10)))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const wallpaperId = parseInt(id, 10);

    const [wall] = await db
      .select()
      .from(wallpapers)
      .where(eq(wallpapers.id, wallpaperId))
      .limit(1);

    if (!wall) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (wall.userId !== user.id && user.roleId !== 1) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .update(wallpapers)
      .set({ status: "delete" })
      .where(eq(wallpapers.id, wallpaperId));

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export const dynamic = "force-dynamic";
