import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { migrateCollectionsCommunityTables } from "@/lib/db/migrate-collections-community";
import { seedCollectionsCommunity } from "@/scripts/seed/collections-community";

export async function POST() {
  try {
    await requireAdmin();
    await migrateCollectionsCommunityTables();
    const seeded = await seedCollectionsCommunity();
    return NextResponse.json({ ok: true, seeded });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
