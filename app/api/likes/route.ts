import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toggleLike } from "@/lib/db/queries/wallpapers";
import { requireAuth } from "@/lib/session";

const schema = z.object({
  wallpaperId: z.number(),
  like: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());
    const result = await toggleLike(user.id, body.wallpaperId, body.like);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
