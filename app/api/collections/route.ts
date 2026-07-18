import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createCollection,
  listCollections,
  countCollections,
  type CollectionSort,
} from "@/lib/db/queries/collections";
import { getCurrentUser, requireAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filter = sp.get("filter") ?? "All";
  const sort = (sp.get("sort") ?? "saves") as CollectionSort;
  const q = sp.get("q") ?? undefined;
  const featured = sp.get("featured") === "1";
  const user = await getCurrentUser();

  const [items, total] = await Promise.all([
    listCollections({ filter, sort, q, featuredOnly: featured, userId: user?.id }),
    countCollections(filter, q),
  ]);

  return NextResponse.json({ items, total });
}

const createSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = createSchema.parse(await req.json());
    const row = await createCollection({
      userId: user.id,
      name: body.name,
      description: body.description,
      category: body.category,
    });
    return NextResponse.json({ collection: row }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
