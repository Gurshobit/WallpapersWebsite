import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";
import { DB_SCHEMA, TABLE_PREFIX } from "../lib/db/schema";

const TABLE = `"${DB_SCHEMA}"."${TABLE_PREFIX}wallpapers"`;

export async function ensureWallpaperUuidColumn() {
  const result = await db.execute<{ exists: boolean }>(sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = ${DB_SCHEMA}
        AND table_name = ${`${TABLE_PREFIX}wallpapers`}
        AND column_name = 'uuid'
    ) AS exists
  `);

  const exists = Boolean(result.rows?.[0]?.exists ?? result[0]?.exists);

  if (exists) {
    console.log("uuid column already exists");
    return;
  }

  console.log("Adding uuid column to wallpapers...");

  await db.execute(
    sql.raw(`ALTER TABLE ${TABLE} ADD COLUMN uuid uuid`)
  );

  await db.execute(
    sql.raw(`UPDATE ${TABLE} SET uuid = gen_random_uuid() WHERE uuid IS NULL`)
  );

  await db.execute(
    sql.raw(`ALTER TABLE ${TABLE} ALTER COLUMN uuid SET DEFAULT gen_random_uuid()`)
  );

  await db.execute(
    sql.raw(`ALTER TABLE ${TABLE} ALTER COLUMN uuid SET NOT NULL`)
  );

  await db.execute(
    sql.raw(
      `CREATE UNIQUE INDEX IF NOT EXISTS hdwallsite_wallpapers_uuid_unique ON ${TABLE} (uuid)`
    )
  );

  await db.execute(
    sql.raw(
      `CREATE INDEX IF NOT EXISTS wallpapers_uuid_idx ON ${TABLE} (uuid)`
    )
  );

  console.log("uuid column added");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  await ensureWallpaperUuidColumn();
  console.log("Migration complete.");
  process.exit(0);
}

const isDirectRun = process.argv[1]?.includes("migrate-add-wallpaper-uuid");

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
