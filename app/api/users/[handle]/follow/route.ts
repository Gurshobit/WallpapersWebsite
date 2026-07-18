import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isFollowing, toggleFollow } from "@/lib/db/queries/follows";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const user = await requireAuth();
    const [target] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, handle))
      .limit(1);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const following = await isFollowing(user.id, target.id);
    return NextResponse.json({ following });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const user = await requireAuth();
    const [target] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, handle))
      .limit(1);
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const result = await toggleFollow(user.id, target.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("yourself") || message.includes("not found")
          ? 400
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  return POST(_req, { params });
}
