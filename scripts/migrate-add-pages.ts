import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating hdws_public.hdwallsite_pages table…");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS hdws_public.hdwallsite_pages (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(500) NOT NULL,
      slug        VARCHAR(500) NOT NULL UNIQUE,
      content     TEXT,
      meta_title  VARCHAR(500),
      meta_description TEXT,
      status      VARCHAR(20) NOT NULL DEFAULT 'published',
      show_in_footer BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log("✓ Table created (or already existed).");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
