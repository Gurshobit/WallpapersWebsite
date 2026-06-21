import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { resolutions } from "@/lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await db.select().from(resolutions).orderBy(asc(resolutions.sortOrder));
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 401 });
  }
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const createSchema = z.object({
  name: z.string().min(1).max(255),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  typeId: z.number().int().default(1),
  showInSidebar: z.boolean().optional().default(false),
});

const reorderSchema = z.object({
  action: z.literal("reorder"),
  ids: z.array(z.number().int()),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (body.action === "reorder") {
      const { ids } = reorderSchema.parse(body);
      await Promise.all(
        ids.map((id, idx) =>
          db.update(resolutions).set({ sortOrder: idx }).where(eq(resolutions.id, id))
        )
      );
      return NextResponse.json({ ok: true });
    }

    const { name, width, height, typeId, showInSidebar } = createSchema.parse(body);
    const slug = slugify(name);

    const [{ max }] = await db
      .select({ max: sql<number>`coalesce(max(${resolutions.sortOrder}),0)` })
      .from(resolutions);

    // Reset PK sequence in case seeded rows used explicit IDs that advanced past the sequence
    await db.execute(
      sql`SELECT setval(
        pg_get_serial_sequence('hdws_public.hdwallsite_resolutions', 'id'),
        COALESCE((SELECT MAX(id) FROM hdws_public.hdwallsite_resolutions), 0)
      )`
    );

    const [created] = await db
      .insert(resolutions)
      .values({ name, width, height, typeId, slug, showInSidebar, sortOrder: (max ?? 0) + 1 })
      .returning();

    return NextResponse.json(created);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
