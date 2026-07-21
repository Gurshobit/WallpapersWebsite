import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import {
  listAdSlots,
  createAdSlot,
  getAdSlotBySlug,
} from "@/lib/db/queries/admin";
import { jsonOk, jsonError } from "@/lib/api-response";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().max(2000).optional()
);
const optionalDate = z.preprocess(
  emptyToUndefined,
  z.coerce.date().optional()
);

const adSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9_-]+$/, "Slug may only contain letters, numbers, - and _"),
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

export async function GET() {
  try {
    await requireAdmin();
    const items = await listAdSlots();
    return jsonOk({ items });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = adSchema.parse(await req.json());

    const existing = await getAdSlotBySlug(body.slug);
    if (existing) {
      return jsonError("A slot with this slug already exists", 409);
    }

    const row = await createAdSlot({
      name: body.name,
      slug: body.slug,
      placement: body.placement ?? null,
      width: body.width ?? null,
      height: body.height ?? null,
      priority: body.priority ?? 0,
      imageUrl: body.imageUrl ?? null,
      linkUrl: body.linkUrl ?? null,
      content: body.content ?? null,
      startsAt: body.startsAt ?? null,
      endsAt: body.endsAt ?? null,
      active: body.active ?? true,
    });
    return jsonOk({ slot: row }, 201);
  } catch (err) {
    return jsonError(err);
  }
}
