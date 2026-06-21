import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { name, url } = createSchema.parse(await req.json());

    const [{ max }] = await db
      .select({ max: sql<number>`coalesce(max(${licenses.sortOrder}),0)` })
      .from(licenses);

    const [created] = await db
      .insert(licenses)
      .values({ name, url, sortOrder: (max ?? 0) + 1 })
      .returning();

    return NextResponse.json(created);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
