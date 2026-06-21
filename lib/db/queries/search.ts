import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../index";
import {
  wallpapers,
  categories,
  tags,
  users,
  userProfiles,
  topDownloads,
  wallpaperTags,
} from "../schema";
import { resolveMediaUrls } from "../../media";

export async function megaSearch(q: string) {
  const trimmed = q.trim();
  if (!trimmed) {
    return { wallpapers: [], categories: [], tags: [], creators: [] };
  }

  const term = `%${trimmed}%`;

  const [wallpaperRows, categoryRows, tagRows, creatorRows] = await Promise.all([
    db
      .select({
        id: wallpapers.id,
        uuid: wallpapers.uuid,
        slug: wallpapers.slug,
        title: wallpapers.title,
        thumbUrl: wallpapers.thumbUrl,
        categoryName: categories.name,
        downloads: topDownloads.last30Days,
      })
      .from(wallpapers)
      .leftJoin(categories, eq(wallpapers.categoryId, categories.id))
      .leftJoin(topDownloads, eq(wallpapers.id, topDownloads.wallpaperId))
      .where(and(eq(wallpapers.status, "active"), ilike(wallpapers.title, term)))
      .orderBy(desc(wallpapers.dateAdded))
      .limit(4),

    db
      .select({
        slug: categories.slug,
        name: categories.name,
        totalWallpapers: categories.totalWallpapers,
      })
      .from(categories)
      .where(ilike(categories.name, term))
      .orderBy(desc(categories.totalWallpapers))
      .limit(5),

    db
      .select({
        slug: tags.slug,
        name: tags.name,
      })
      .from(tags)
      .where(or(ilike(tags.name, term), ilike(tags.slug, term)))
      .orderBy(desc(tags.totalWallpapers))
      .limit(8),

    db
      .select({
        username: users.username,
        avatarUrl: users.avatarUrl,
        nickname: userProfiles.nickname,
        totalUploads: users.totalUploads,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(or(ilike(users.username, term), ilike(userProfiles.nickname, term)))
      .orderBy(desc(users.totalUploads))
      .limit(4),
  ]);

  return {
    wallpapers: wallpaperRows.map(resolveMediaUrls),
    categories: categoryRows,
    tags: tagRows,
    creators: creatorRows,
  };
}

export async function searchWallpaperIds(q: string, limit = 500) {
  const trimmed = q.trim();
  if (!trimmed) return [];

  const term = `%${trimmed}%`;

  const rows = await db
    .selectDistinct({ id: wallpapers.id })
    .from(wallpapers)
    .leftJoin(wallpaperTags, eq(wallpapers.id, wallpaperTags.wallpaperId))
    .leftJoin(tags, eq(wallpaperTags.tagId, tags.id))
    .leftJoin(categories, eq(wallpapers.categoryId, categories.id))
    .where(
      and(
        eq(wallpapers.status, "active"),
        or(
          ilike(wallpapers.title, term),
          ilike(tags.name, term),
          ilike(categories.name, term),
          ilike(wallpapers.authorName, term)
        )
      )
    )
    .limit(limit);

  return rows.map((r) => r.id);
}
