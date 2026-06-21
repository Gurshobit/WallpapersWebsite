import { NextRequest, NextResponse } from "next/server";
import { listCollections, countCollections, type CollectionSort } from "@/lib/db/queries/collections";
import { getCurrentUser } from "@/lib/session";

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
