import { db } from "../../lib/db";
import { licenses } from "../../lib/db/schema";
import { readWallsSql, parseInsertRows } from "./parse-sql";

export async function seedLicenses() {
  const sql = readWallsSql();
  const rows = parseInsertRows(sql, "hdwallsite_licenses");

  for (const row of rows) {
    await db
      .insert(licenses)
      .values({
        id: row.id as number,
        name: row.name as string,
        url: row.url as string | null,
        sortOrder: (row.sortorder as number) ?? 0,
      })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${rows.length} licenses`);
}
