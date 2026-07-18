import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  adminListCollections,
  createCollection,
} from "@/lib/db/queries/collections";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const q = req.nextUrl.searchParams.get("q") ?? undefined;
    const items = await adminListCollections(q);
    return NextResponse.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  featured: z.boolean().optional(),
  userId: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = createSchema.parse(await req.json());
    const row = await createCollection({
      userId: body.userId ?? admin.id,
      name: body.name,
      description: body.description,
      category: body.category,
      featured: body.featured ?? false,
    });
    return NextResponse.json({ collection: row }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = message === "Unauthorized" || message === "Forbidden" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
