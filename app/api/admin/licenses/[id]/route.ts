import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.delete(licenses).where(eq(licenses.id, parseInt(id)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
