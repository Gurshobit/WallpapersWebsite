/**
 * Targeted migration for the richer `ad_slots` model (image/link/priority/
 * scheduling/timestamps + free-form placement). Applied directly rather than
 * via `drizzle-kit push` to avoid unrelated interactive/destructive prompts.
 *
 * Run: pnpm tsx --env-file=.env.local scripts/migrate-ad-slots.ts
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (use --env-file=.env.local)");

const sql = neon(url);
const TABLE = "hdws_public.hdwallsite_ad_slots";

async function main() {
  console.log("Relaxing placement to varchar(100)…");
  await sql(
    `ALTER TABLE ${TABLE} ALTER COLUMN placement TYPE varchar(100) USING placement::text`
  );

  console.log("Adding new columns (idempotent)…");
  await sql(`ALTER TABLE ${TABLE}
    ADD COLUMN IF NOT EXISTS image_url text,
    ADD COLUMN IF NOT EXISTS link_url text,
    ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS starts_at timestamp,
    ADD COLUMN IF NOT EXISTS ends_at timestamp,
    ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()`);

  console.log("✓ ad_slots migration complete");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
