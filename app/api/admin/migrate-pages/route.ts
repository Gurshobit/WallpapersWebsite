import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/** One-time migration endpoint — creates the pages table if missing. */
export async function POST() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hdws_public.hdwallsite_pages (
        id              SERIAL PRIMARY KEY,
        title           VARCHAR(500) NOT NULL,
        slug            VARCHAR(500) NOT NULL UNIQUE,
        content         TEXT,
        meta_title      VARCHAR(500),
        meta_description TEXT,
        status          VARCHAR(20) NOT NULL DEFAULT 'published',
        show_in_footer  BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMP DEFAULT NOW(),
        updated_at      TIMESTAMP DEFAULT NOW()
      )
    `);
    return NextResponse.json({ ok: true, message: "Table created (or already existed)" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
