import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

const schema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500).regex(/^[a-z0-9-]+$/),
  content: z.string().optional().default(""),
  metaTitle: z.string().max(500).optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["published", "draft"]).default("published"),
  showInFooter: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const rows = await db
    .select()
    .from(pages)
    .orderBy(asc(pages.sortOrder), asc(pages.id));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const [row] = await db.insert(pages).values(body).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
