import { db } from "../../lib/db";
import { categories } from "../../lib/db/schema";
import { readWallsSql, parseInsertRows } from "./parse-sql";

export async function seedCategories() {
  const sql = readWallsSql();
  const rows = parseInsertRows(sql, "hdwallsite_categories");

  for (const row of rows) {
    const catid = row.catid as number;
    if (catid === 1) continue; // skip [TOP] placeholder

    let slug = row.slug as string | null;
    if (slug?.startsWith("/")) slug = slug.slice(1);

    await db
      .insert(categories)
      .values({
        id: catid,
        parentId: (row.parentid as number) || 1,
        slug: slug ?? `category-${catid}`,
        name: row.name as string,
        pageTitle: row.page_title as string | null,
        pageDescription: row.page_description as string | null,
        metaTitle: row.meta_title as string | null,
        metaDescription: row.meta_description as string | null,
        metaKeywords: row.meta_keywords as string | null,
        totalWallpapers: (row.total_wallpapers as number) ?? 0,
      })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${rows.length - 1} categories`);
}
