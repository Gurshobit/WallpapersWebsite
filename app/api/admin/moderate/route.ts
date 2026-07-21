import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { moderateWallpaper } from "@/lib/db/queries/admin";
import { requireStaff } from "@/lib/session";

const schema = z.object({
  wallpaperId: z.number(),
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireStaff();
    const body = schema.parse(await req.json());
    await moderateWallpaper(body.wallpaperId, body.action, admin.id, body.notes);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
