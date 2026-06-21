import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { resolutionTypes } from "@/lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";

const createSchema = z.object({
  name: z.string().min(1).max(200),
});

const reorderSchema = z.object({
  action: z.literal("reorder"),
  ids: z.array(z.number().int()),
});

export async function GET() {
  try {
    await requireAdmin();
    const rows = await db
      .select()
      .from(resolutionTypes)
      .orderBy(asc(resolutionTypes.sortOrder), asc(resolutionTypes.id));
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (body.action === "reorder") {
      const { ids } = reorderSchema.parse(body);
      await Promise.all(
        ids.map((id, idx) =>
          db.update(resolutionTypes).set({ sortOrder: idx + 1 }).where(eq(resolutionTypes.id, id))
        )
      );
      return NextResponse.json({ ok: true });
    }

    const { name } = createSchema.parse(body);
    const [{ maxSort }] = await db
      .select({ maxSort: sql<number>`coalesce(max(${resolutionTypes.sortOrder}), 0)` })
      .from(resolutionTypes);

    // Reset PK sequence in case seeded rows used explicit IDs that advanced past the sequence
    await db.execute(
      sql`SELECT setval(
        pg_get_serial_sequence('hdws_public.hdwallsite_resolution_types', 'id'),
        COALESCE((SELECT MAX(id) FROM hdws_public.hdwallsite_resolution_types), 0)
      )`
    );

    const [created] = await db
      .insert(resolutionTypes)
      .values({ name, sortOrder: (maxSort ?? 0) + 1 })
      .returning();

    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
