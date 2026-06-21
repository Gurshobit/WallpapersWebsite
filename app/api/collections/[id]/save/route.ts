import { NextRequest, NextResponse } from "next/server";
import { toggleCollectionSave } from "@/lib/db/queries/collections";
import { requireAuth } from "@/lib/session";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const collectionId = parseInt(id, 10);
    if (!Number.isFinite(collectionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const result = await toggleCollectionSave(collectionId, user.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 400 }
    );
  }
}
