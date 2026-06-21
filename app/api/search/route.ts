import { NextRequest, NextResponse } from "next/server";
import { megaSearch } from "@/lib/db/queries/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const result = await megaSearch(q);
  return NextResponse.json(result);
}
