import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { siteConfigs } from "@/lib/db/schema";
import { jsonError } from "@/lib/api-response";

const patchSchema = z.object({
  configs: z.record(z.string(), z.string()),
});

/** PATCH /api/admin/configs  — upsert one or more siteConfig key→value pairs */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const { configs } = patchSchema.parse(await req.json());

    await Promise.all(
      Object.entries(configs).map(([param, value]) =>
        db
          .insert(siteConfigs)
          .values({ param, value })
          .onConflictDoUpdate({ target: siteConfigs.param, set: { value } })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
