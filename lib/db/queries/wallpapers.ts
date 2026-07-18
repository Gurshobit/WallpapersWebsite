import {
  eq,
  and,
  desc,
  asc,
  sql,
  count,
  inArray,
  notInArray,
  isNull,
} from "drizzle-orm";
import { db } from "../index";
import {
  wallpapers,
  categories,
  users,
  userProfiles,
  licenses,
  wallpaperImages,
  wallpaperComments,
  topDownloads,
  topPopular,
  tags,
  wallpaperTags,
  resolutions,
  resolutionTypes,
  shortlists,
  ratings,
} from "../schema";
import { PAGE_SIZE } from "../../routing";
import { resolveMediaUrl, resolveMediaUrls } from "../../media";
import { searchWallpaperIds } from "./search";

export type SortMode = "latest" | "popular" | "downloads";

export type FeaturedWallpaper = {
  id: number;
  uuid: string;
  slug: string | null;
  title: string;
  thumbUrl: string;
  description: string | null;
  authorName: string | null;
  categoryName: string;
  username: string | null;
  views: number | null;
  downloads: number | null;
};

export type WallpaperBySlugData = {
  wallpaper: typeof wallpapers.$inferSelect;
  category: typeof categories.$inferSelect;
  license: typeof licenses.$inferSelect;
  uploader: typeof users.$inferSelect;
  profile: typeof userProfiles.$inferSelect | null;
  views: number | null;
  downloads: number | null;
  images: (typeof wallpaperImages.$inferSelect)[];
  comments: {
    id: number;
    message: string;
    dateAdded: Date | null;
    username: string;
    avatarUrl: string | null;
  }[];
};

function sortColumn(mode: SortMode) {
  switch (mode) {
    case "popular":
      return desc(topPopular.last30Days);
    case "downloads":
      return desc(topDownloads.last30Days);
    default:
      return desc(wallpapers.dateAdded);
  }
}

export async function countWallpapers(status = "active") {
  const [result] = await db
    .select({ count: count() })
    .from(wallpapers)
    .where(eq(wallpapers.status, status as "active"));
  return result?.count ?? 0;
}

export async function listWallpapers({
  sort = "latest",
  page = 1,
  pageSize = PAGE_SIZE,
  q,
  wallpaperIds,
  categorySlug,
  tagSlug,
  resolutionSlug,
  color,
  userId,
  status = "active",
}: {
  sort?: SortMode;
  page?: number;
  pageSize?: number;
  q?: string;
  wallpaperIds?: number[];
  categorySlug?: string;
  tagSlug?: string;
  resolutionSlug?: string;
  color?: string;
  userId?: number;
  status?: string;
}) {
  const offset = (page - 1) * pageSize;
  const conditions = [eq(wallpapers.status, status as "active")];

  if (q?.trim()) {
    const ids = wallpaperIds ?? (await searchWallpaperIds(q));
    if (ids.length === 0) {
      return { items: [], total: 0, page, pageSize, totalPages: 0 };
    }
    conditions.push(inArray(wallpapers.id, ids));
  } else if (wallpaperIds) {
    if (wallpaperIds.length === 0) {
      return { items: [], total: 0, page, pageSize, totalPages: 0 };
    }
    conditions.push(inArray(wallpapers.id, wallpaperIds));
  }

  if (userId) conditions.push(eq(wallpapers.userId, userId));
  if (color) {
    conditions.push(
      sql`${wallpapers.dominantColors} @> ${JSON.stringify([color])}::jsonb`
    );
  }

  let baseQuery = db
    .select({
      id: wallpapers.id,
      uuid: wallpapers.uuid,
      slug: wallpapers.slug,
      title: wallpapers.title,
      thumbUrl: wallpapers.thumbUrl,
      width: wallpapers.width,
      height: wallpapers.height,
      featured: wallpapers.featured,
      ratingValue: wallpapers.ratingValue,
      dateAdded: wallpapers.dateAdded,
      dominantColors: wallpapers.dominantColors,
      authorName: wallpapers.authorName,
      username: users.username,
      categoryName: categories.name,
      downloads: topDownloads.last30Days,
    })
    .from(wallpapers)
    .leftJoin(categories, eq(wallpapers.categoryId, categories.id))
    .leftJoin(users, eq(wallpapers.userId, users.id))
    .leftJoin(topPopular, eq(wallpapers.id, topPopular.wallpaperId))
    .leftJoin(topDownloads, eq(wallpapers.id, topDownloads.wallpaperId))
    .$dynamic();

  if (categorySlug) {
    // categories is already left-joined above — just filter on the slug
    baseQuery = baseQuery
      .where(and(...conditions, eq(categories.slug, categorySlug))) as typeof baseQuery;
  } else if (tagSlug) {
    baseQuery = baseQuery
      .innerJoin(wallpaperTags, eq(wallpapers.id, wallpaperTags.wallpaperId))
      .innerJoin(tags, eq(wallpaperTags.tagId, tags.id))
      .where(and(...conditions, eq(tags.slug, tagSlug))) as typeof baseQuery;
  } else if (resolutionSlug) {
    baseQuery = baseQuery
      .innerJoin(wallpaperImages, eq(wallpapers.id, wallpaperImages.wallpaperId))
      .innerJoin(resolutions, eq(wallpaperImages.resolutionId, resolutions.id))
      .where(and(...conditions, eq(resolutions.slug, resolutionSlug))) as typeof baseQuery;
  } else {
    baseQuery = baseQuery.where(and(...conditions)) as typeof baseQuery;
  }

  const items = await baseQuery
    .orderBy(sortColumn(sort))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(wallpapers)
    .where(and(...conditions));

  return {
    items: items.map(resolveMediaUrls),
    total: totalResult?.count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalResult?.count ?? 0) / pageSize),
  };
}

/** Returns up to `limit` featured wallpapers for the hero carousel. Falls back to latest. */
export async function getFeaturedWallpapers(limit = 5): Promise<FeaturedWallpaper[]> {
  const selectShape = {
    id: wallpapers.id,
    uuid: wallpapers.uuid,
    slug: wallpapers.slug,
    title: wallpapers.title,
    thumbUrl: wallpapers.thumbUrl,
    description: wallpapers.description,
    authorName: wallpapers.authorName,
    categoryName: categories.name,
    username: users.username,
    views: topPopular.last30Days,
    downloads: topDownloads.last30Days,
  } as const;

  const featured = await db
    .select(selectShape)
    .from(wallpapers)
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .leftJoin(users, eq(wallpapers.userId, users.id))
    .leftJoin(topPopular, eq(wallpapers.id, topPopular.wallpaperId))
    .leftJoin(topDownloads, eq(wallpapers.id, topDownloads.wallpaperId))
    .where(and(eq(wallpapers.featured, true), eq(wallpapers.status, "active")))
    .orderBy(desc(wallpapers.dateAdded))
    .limit(limit);

  if (featured.length >= limit) return featured.map(resolveMediaUrls);

  // Pad with latest non-featured wallpapers if not enough featured ones
  const featuredIds = featured.map((f) => f.id);
  const needed = limit - featured.length;

  const fallback = await db
    .select(selectShape)
    .from(wallpapers)
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .leftJoin(users, eq(wallpapers.userId, users.id))
    .leftJoin(topPopular, eq(wallpapers.id, topPopular.wallpaperId))
    .leftJoin(topDownloads, eq(wallpapers.id, topDownloads.wallpaperId))
    .where(
      featuredIds.length
        ? and(eq(wallpapers.status, "active"), notInArray(wallpapers.id, featuredIds))
        : eq(wallpapers.status, "active")
    )
    .orderBy(desc(wallpapers.dateAdded))
    .limit(needed);

  return [...featured, ...fallback].map(resolveMediaUrls);
}

export async function getFeaturedWallpaper(): Promise<FeaturedWallpaper | null> {
  const [row] = await db
    .select({
      id: wallpapers.id,
      uuid: wallpapers.uuid,
      slug: wallpapers.slug,
      title: wallpapers.title,
      thumbUrl: wallpapers.thumbUrl,
      description: wallpapers.description,
      authorName: wallpapers.authorName,
      categoryName: categories.name,
      username: users.username,
      views: topPopular.last30Days,
      downloads: topDownloads.last30Days,
    })
    .from(wallpapers)
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .leftJoin(users, eq(wallpapers.userId, users.id))
    .leftJoin(topPopular, eq(wallpapers.id, topPopular.wallpaperId))
    .leftJoin(topDownloads, eq(wallpapers.id, topDownloads.wallpaperId))
    .where(and(eq(wallpapers.featured, true), eq(wallpapers.status, "active")))
    .orderBy(desc(wallpapers.dateAdded))
    .limit(1);
  if (row) return resolveMediaUrls(row);

  const [latest] = await db
    .select({
      id: wallpapers.id,
      uuid: wallpapers.uuid,
      slug: wallpapers.slug,
      title: wallpapers.title,
      thumbUrl: wallpapers.thumbUrl,
      description: wallpapers.description,
      authorName: wallpapers.authorName,
      categoryName: categories.name,
      username: users.username,
      views: topPopular.last30Days,
      downloads: topDownloads.last30Days,
    })
    .from(wallpapers)
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .leftJoin(users, eq(wallpapers.userId, users.id))
    .leftJoin(topPopular, eq(wallpapers.id, topPopular.wallpaperId))
    .leftJoin(topDownloads, eq(wallpapers.id, topDownloads.wallpaperId))
    .where(eq(wallpapers.status, "active"))
    .orderBy(desc(wallpapers.dateAdded))
    .limit(1);

  return latest ? resolveMediaUrls(latest) : null;
}

export async function getWallpaperBySlug(
  slug: string
): Promise<WallpaperBySlugData | null> {
  const [wall] = await db
    .select({
      wallpaper: wallpapers,
      category: categories,
      license: licenses,
      uploader: users,
      profile: userProfiles,
      views: topPopular.last30Days,
      downloads: topDownloads.last30Days,
    })
    .from(wallpapers)
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .innerJoin(licenses, eq(wallpapers.licenseId, licenses.id))
    .innerJoin(users, eq(wallpapers.userId, users.id))
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .leftJoin(topPopular, eq(wallpapers.id, topPopular.wallpaperId))
    .leftJoin(topDownloads, eq(wallpapers.id, topDownloads.wallpaperId))
    .where(and(eq(wallpapers.slug, slug), eq(wallpapers.status, "active")))
    .limit(1);

  if (!wall) return null;

  const row = wall as Omit<WallpaperBySlugData, "images" | "comments">;
  const wallpaperId = row.wallpaper.id;

  const images = await db
    .select()
    .from(wallpaperImages)
    .where(
      and(
        eq(wallpaperImages.wallpaperId, wallpaperId),
        eq(wallpaperImages.status, "active")
      )
    )
    .orderBy(desc(wallpaperImages.width));

  const comments = await db
    .select({
      id: wallpaperComments.id,
      message: wallpaperComments.message,
      dateAdded: wallpaperComments.dateAdded,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(wallpaperComments)
    .innerJoin(users, eq(wallpaperComments.userId, users.id))
    .where(
      and(
        eq(wallpaperComments.wallpaperId, wallpaperId),
        eq(wallpaperComments.status, "active")
      )
    )
    .orderBy(desc(wallpaperComments.dateAdded))
    .limit(20);

  return {
    ...row,
    wallpaper: {
      ...row.wallpaper,
      thumbUrl: resolveMediaUrl(row.wallpaper.thumbUrl),
    },
    images: images.map((image) => ({
      ...image,
      url: resolveMediaUrl(image.url),
    })),
    comments,
  };
}

export async function getRelatedWallpapers(
  wallpaperId: number,
  categoryId: number,
  limit = 8
) {
  const rows = await db
    .select({
      id: wallpapers.id,
      uuid: wallpapers.uuid,
      slug: wallpapers.slug,
      title: wallpapers.title,
      thumbUrl: wallpapers.thumbUrl,
      width: wallpapers.width,
      height: wallpapers.height,
    })
    .from(wallpapers)
    .leftJoin(topPopular, eq(wallpapers.id, topPopular.wallpaperId))
    .where(
      and(
        eq(wallpapers.categoryId, categoryId),
        eq(wallpapers.status, "active"),
        sql`${wallpapers.id} != ${wallpaperId}`
      )
    )
    .orderBy(desc(topPopular.last30Days))
    .limit(limit);

  return rows.map(resolveMediaUrls);
}

export async function getSidebarCategories() {
  return db
    .select()
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(asc(categories.sortOrder), asc(categories.id));
}

export async function getSidebarResolutions() {
  return db
    .select()
    .from(resolutions)
    .where(eq(resolutions.showInSidebar, true))
    .orderBy(asc(resolutions.sortOrder));
}

export async function getPopularColors(limit = 12) {
  const result = await db.execute(sql`
    SELECT color, COUNT(*) as cnt
    FROM (
      SELECT jsonb_array_elements_text(dominant_colors) as color
      FROM ${wallpapers}
      WHERE status = 'active' AND dominant_colors IS NOT NULL
    ) sub
    GROUP BY color
    ORDER BY cnt DESC
    LIMIT ${limit}
  `);
  return (result.rows as { color: string; cnt: string }[]).map((r) => r.color);
}

export async function getSidebarResolutionGroups() {
  const [types, res] = await Promise.all([
    db
      .select()
      .from(resolutionTypes)
      .orderBy(asc(resolutionTypes.sortOrder), asc(resolutionTypes.id)),
    db
      .select()
      .from(resolutions)
      .where(eq(resolutions.showInSidebar, true))
      .orderBy(asc(resolutions.sortOrder), asc(resolutions.id)),
  ]);

  return types
    .map((t) => ({
      id: t.id,
      name: t.name,
      resolutions: res
        .filter((r) => r.typeId === t.id)
        .map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          width: r.width,
          height: r.height,
        })),
    }))
    .filter((g) => g.resolutions.length > 0);
}

export async function getBrowseSidebar() {
  const [categories, resolutions, colors, resolutionGroups] = await Promise.all([
    getSidebarCategories(),
    getSidebarResolutions(),
    getPopularColors(),
    getSidebarResolutionGroups(),
  ]);
  return { categories, resolutions, colors, resolutionGroups };
}

export async function getUserShortlist(userId: number, page = 1, pageSize = PAGE_SIZE) {
  const offset = (page - 1) * pageSize;
  const items = await db
    .select({
      id: wallpapers.id,
      uuid: wallpapers.uuid,
      slug: wallpapers.slug,
      title: wallpapers.title,
      thumbUrl: wallpapers.thumbUrl,
      width: wallpapers.width,
      height: wallpapers.height,
      categoryName: categories.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      authorName: wallpapers.authorName,
      downloads: topDownloads.last30Days,
    })
    .from(shortlists)
    .innerJoin(wallpapers, eq(shortlists.wallpaperId, wallpapers.id))
    .leftJoin(categories, eq(wallpapers.categoryId, categories.id))
    .leftJoin(users, eq(wallpapers.userId, users.id))
    .leftJoin(topDownloads, eq(wallpapers.id, topDownloads.wallpaperId))
    .where(eq(shortlists.userId, userId))
    .orderBy(desc(shortlists.dateAdded))
    .limit(pageSize)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(shortlists)
    .where(eq(shortlists.userId, userId));

  return {
    items: items.map(resolveMediaUrls),
    total: totalResult?.count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalResult?.count ?? 0) / pageSize),
  };
}

export async function getShortlistCount(userId: number) {
  const [result] = await db
    .select({ count: count() })
    .from(shortlists)
    .where(eq(shortlists.userId, userId));
  return result?.count ?? 0;
}

export async function toggleShortlist(userId: number, wallpaperId: number) {
  const existing = await db
    .select()
    .from(shortlists)
    .where(
      and(
        eq(shortlists.userId, userId),
        eq(shortlists.wallpaperId, wallpaperId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(shortlists)
      .where(
        and(
          eq(shortlists.userId, userId),
          eq(shortlists.wallpaperId, wallpaperId)
        )
      );
    return { added: false };
  }

  await db.insert(shortlists).values({ userId, wallpaperId });
  return { added: true };
}

export async function toggleLike(userId: number, wallpaperId: number, like: boolean) {
  const existing = await db
    .select()
    .from(ratings)
    .where(
      and(eq(ratings.userId, userId), eq(ratings.wallpaperId, wallpaperId))
    )
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].iLike === like) {
      await db.delete(ratings).where(eq(ratings.id, existing[0].id));
      return { action: "removed" };
    }
    await db
      .update(ratings)
      .set({ iLike: like, dateVoted: new Date() })
      .where(eq(ratings.id, existing[0].id));
    return { action: "updated" };
  }

  await db.insert(ratings).values({ userId, wallpaperId, iLike: like });
  return { action: "added" };
}

export async function getLikedWallpaperIds(userId: number) {
  const rows = await db
    .select({ wallpaperId: ratings.wallpaperId })
    .from(ratings)
    .where(and(eq(ratings.userId, userId), eq(ratings.iLike, true)));
  return rows.map((r) => r.wallpaperId);
}

export async function getAllActiveSlugs() {
  return db
    .select({ slug: wallpapers.slug, dateAdded: wallpapers.dateAdded })
    .from(wallpapers)
    .where(eq(wallpapers.status, "active"));
}
