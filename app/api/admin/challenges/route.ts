import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { challenges } from "@/lib/db/schema";
import { listChallenges } from "@/lib/db/queries/community";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export async function GET() {
  try {
    await requireAdmin();
    const items = await listChallenges(false);
    return NextResponse.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

const createSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().min(1),
  accentColor: z.string().max(20).optional(),
  prize: z.string().optional(),
  deadline: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = createSchema.parse(await req.json());
    const base = slugify(body.title) || "challenge";
    let slug = base;
    let n = 0;
    while (true) {
      const [existing] = await db
        .select({ id: challenges.id })
        .from(challenges)
        .where(eq(challenges.slug, slug))
        .limit(1);
      if (!existing) break;
      n += 1;
      slug = `${base}-${n}`;
    }

    const [row] = await db
      .insert(challenges)
      .values({
        title: body.title,
        slug,
        description: body.description,
        accentColor: body.accentColor ?? "#ff2e63",
        prize: body.prize ?? null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        active: body.active ?? true,
      })
      .returning();

    return NextResponse.json({ challenge: row }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const status = message === "Unauthorized" || message === "Forbidden" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
