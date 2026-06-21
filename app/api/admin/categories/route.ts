import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, isNull, sql } from "drizzle-orm";
import { listCategories } from "@/lib/db/queries/admin";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  parentId: z.number().int().nullable().optional().default(null),
});

const reorderSchema = z.object({
  action: z.literal("reorder"),
  ids: z.array(z.number().int()),
});

export async function GET() {
  try {
    await requireAdmin();
    const rows = await listCategories();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const action = body.action as string | undefined;

    if (action === "reorder") {
      const { ids } = reorderSchema.parse(body);
      await Promise.all(
        ids.map((id, idx) =>
          db.update(categories).set({ sortOrder: idx + 1 }).where(eq(categories.id, id))
        )
      );
      return NextResponse.json({ ok: true });
    }

    const { name, parentId } = createSchema.parse(body);
    const slug = slugify(name);

    // Auto-assign sortOrder at end of siblings (same parent)
    const [{ maxSort }] = await db
      .select({ maxSort: sql<number>`coalesce(max(${categories.sortOrder}), 0)` })
      .from(categories)
      .where(
        parentId == null
          ? isNull(categories.parentId)
          : eq(categories.parentId, parentId)
      );

    const [created] = await db
      .insert(categories)
      .values({ name, parentId: parentId ?? null, slug, sortOrder: (maxSort ?? 0) + 1 })
      .returning();

    return NextResponse.json(created);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
