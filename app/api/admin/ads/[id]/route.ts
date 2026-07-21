import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  updateAdSlot,
  deleteAdSlot,
  getAdSlotBySlug,
  getAdSlotById,
} from "@/lib/db/queries/admin";
import { jsonOk, jsonError } from "@/lib/api-response";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);
const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().max(2000).optional()
);
const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

const patchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9_-]+$/, "Slug may only contain letters, numbers, - and _")
    .optional(),
  placement: z.preprocess(
    emptyToUndefined,
    z.string().min(1).max(100).optional()
  ),
  width: z.coerce.number().int().positive().max(4000).optional(),
  height: z.coerce.number().int().positive().max(4000).optional(),
  priority: z.coerce.number().int().min(0).max(1000).optional(),
  imageUrl: optionalUrl,
  linkUrl: optionalUrl,
  content: z.preprocess(emptyToUndefined, z.string().max(20000).optional()),
  startsAt: optionalDate,
  endsAt: optionalDate,
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const slotId = parseInt(id, 10);
    if (Number.isNaN(slotId)) return jsonError("Invalid id", 400);

    const body = patchSchema.parse(await req.json());

    if (body.slug) {
      const existing = await getAdSlotBySlug(body.slug);
      if (existing && existing.id !== slotId) {
        return jsonError("A slot with this slug already exists", 409);
      }
    }

    const current = await getAdSlotById(slotId);
    if (!current) return jsonError("Not found", 404);

    const row = await updateAdSlot(slotId, {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.placement !== undefined && { placement: body.placement }),
      ...(body.width !== undefined && { width: body.width }),
      ...(body.height !== undefined && { height: body.height }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.startsAt !== undefined && { startsAt: body.startsAt }),
      ...(body.endsAt !== undefined && { endsAt: body.endsAt }),
      ...(body.active !== undefined && { active: body.active }),
    });
    return jsonOk({ slot: row });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const slotId = parseInt(id, 10);
    if (Number.isNaN(slotId)) return jsonError("Invalid id", 400);
    await deleteAdSlot(slotId);
    return jsonOk({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
