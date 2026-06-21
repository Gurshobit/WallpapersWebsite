import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { updateAdminUser } from "@/lib/db/queries/admin";

const patchSchema = z.object({
  status: z
    .enum(["active", "pending", "suspended", "closed", "email_changed", "delete"])
    .optional(),
  roleId: z.number().int().min(1).max(3).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = patchSchema.parse(await req.json());

    if (userId === admin.id && body.status && body.status !== "active") {
      return NextResponse.json(
        { error: "You cannot change your own account status" },
        { status: 400 }
      );
    }

    const updated = await updateAdminUser(userId, body);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status =
      message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
