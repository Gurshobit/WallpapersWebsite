import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toggleShortlist } from "@/lib/db/queries/wallpapers";
import { requireAuth } from "@/lib/session";

const schema = z.object({ wallpaperId: z.number() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());
    const result = await toggleShortlist(user.id, body.wallpaperId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const wallpaperId = parseInt(req.nextUrl.searchParams.get("wallpaperId") ?? "0", 10);
    const { getUserShortlist } = await import("@/lib/db/queries/wallpapers");
    const result = await getUserShortlist(user.id);
    const isShortlisted = result.items.some((i) => i.id === wallpaperId);
    return NextResponse.json({ isShortlisted, count: result.total });
  } catch {
    return NextResponse.json({ isShortlisted: false, count: 0 });
  }
}
