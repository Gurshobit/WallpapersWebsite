import { db } from "../../lib/db";
import { resolutionTypes, resolutions } from "../../lib/db/schema";
import { readWallsSql, parseInsertRows } from "./parse-sql";

export async function seedResolutions() {
  const sql = readWallsSql();

  const typeRows = parseInsertRows(sql, "hdwallsite_resolutions_types");
  for (const row of typeRows) {
    await db
      .insert(resolutionTypes)
      .values({
        id: row.id as number,
        name: row.name as string,
      })
      .onConflictDoNothing();
  }

  const resRows = parseInsertRows(sql, "hdwallsite_resolutions");
  for (const row of resRows) {
    await db
      .insert(resolutions)
      .values({
        id: row.id as number,
        typeId: row.typeid as number,
        name: row.name as string,
        slug: (row.slug as string) ?? `res-${row.id}`,
        width: row.width as number | null,
        height: row.height as number | null,
        pageTitle: row.page_title as string | null,
        metaTitle: row.meta_title as string | null,
        metaDescription: row.meta_description as string | null,
        metaKeywords: row.meta_keywords as string | null,
        sortOrder: (row.sortorder as number) ?? 0,
        showInSidebar: Boolean(row.sidebar),
      })
      .onConflictDoNothing();
  }

  console.log(
    `Seeded ${typeRows.length} resolution types, ${resRows.length} resolutions`
  );
}
