import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../index";
import {
  collectionSaves,
  collectionWallpapers,
  collections,
  users,
  userProfiles,
  wallpapers,
} from "../schema";

export type CollectionSort = "saves" | "views" | "count";

export type CollectionListItem = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  featured: boolean;
  saveCount: number;
  viewCount: number;
  wallpaperCount: number;
  curatorUsername: string;
  curatorAvatar: string | null;
  thumbs: string[];
  savedByUser?: boolean;
};

const COLLECTION_FILTERS = [
  "All",
  "Nature",
  "Space",
  "Abstract",
  "Cars",
  "Architecture",
] as const;

export { COLLECTION_FILTERS };

function sortOrder(sort: CollectionSort) {
  switch (sort) {
    case "views":
      return desc(collections.viewCount);
    case "count":
      return desc(collections.wallpaperCount);
    default:
      return desc(collections.saveCount);
  }
}

async function attachThumbs(
  rows: {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    category: string | null;
    featured: boolean;
    saveCount: number;
    viewCount: number;
    wallpaperCount: number;
    curatorUsername: string;
    curatorAvatar: string | null;
  }[]
): Promise<CollectionListItem[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const thumbRows = await db
    .select({
      collectionId: collectionWallpapers.collectionId,
      thumbUrl: wallpapers.thumbUrl,
      uuid: wallpapers.uuid,
    })
    .from(collectionWallpapers)
    .innerJoin(wallpapers, eq(collectionWallpapers.wallpaperId, wallpapers.id))
    .where(inArray(collectionWallpapers.collectionId, ids))
    .orderBy(asc(collectionWallpapers.sortOrder));

  const thumbMap = new Map<number, string[]>();
  for (const row of thumbRows) {
    const list = thumbMap.get(row.collectionId) ?? [];
    if (list.length < 3) {
      list.push(row.thumbUrl || row.uuid);
      thumbMap.set(row.collectionId, list);
    }
  }

  return rows.map((row) => ({
    ...row,
    thumbs: thumbMap.get(row.id) ?? [],
  }));
}

export async function listCollections({
  filter = "All",
  sort = "saves",
  q,
  featuredOnly = false,
  limit = 50,
  userId,
}: {
  filter?: string;
  sort?: CollectionSort;
  q?: string;
  featuredOnly?: boolean;
  limit?: number;
  userId?: number;
}) {
  const conditions = [eq(collections.status, "active")];
  if (filter && filter !== "All") {
    conditions.push(eq(collections.category, filter));
  }
  if (featuredOnly) conditions.push(eq(collections.featured, true));
  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    conditions.push(
      or(
        ilike(collections.name, term),
        ilike(collections.description, term),
        ilike(users.username, term)
      )!
    );
  }

  const rows = await db
    .select({
      id: collections.id,
      slug: collections.slug,
      name: collections.name,
      description: collections.description,
      category: collections.category,
      featured: collections.featured,
      saveCount: collections.saveCount,
      viewCount: collections.viewCount,
      wallpaperCount: collections.wallpaperCount,
      curatorUsername: users.username,
      curatorAvatar: users.avatarUrl,
    })
    .from(collections)
    .innerJoin(users, eq(collections.userId, users.id))
    .where(and(...conditions))
    .orderBy(sortOrder(sort))
    .limit(limit);

  const items = await attachThumbs(rows);

  if (!userId) return items;

  const saved = await db
    .select({ collectionId: collectionSaves.collectionId })
    .from(collectionSaves)
    .where(eq(collectionSaves.userId, userId));

  const savedSet = new Set(saved.map((s) => s.collectionId));
  return items.map((item) => ({
    ...item,
    savedByUser: savedSet.has(item.id),
  }));
}

export async function getCollectionBySlug(slug: string, viewerUserId?: number) {
  const [row] = await db
    .select({
      id: collections.id,
      slug: collections.slug,
      name: collections.name,
      description: collections.description,
      category: collections.category,
      featured: collections.featured,
      saveCount: collections.saveCount,
      viewCount: collections.viewCount,
      wallpaperCount: collections.wallpaperCount,
      status: collections.status,
      userId: collections.userId,
      createdAt: collections.createdAt,
      updatedAt: collections.updatedAt,
      curatorUsername: users.username,
      curatorAvatar: users.avatarUrl,
      curatorNickname: userProfiles.nickname,
    })
    .from(collections)
    .innerJoin(users, eq(collections.userId, users.id))
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(and(eq(collections.slug, slug), eq(collections.status, "active")))
    .limit(1);

  if (!row) return null;

  const wallpaperRows = await db
    .select({
      id: wallpapers.id,
      uuid: wallpapers.uuid,
      slug: wallpapers.slug,
      title: wallpapers.title,
      thumbUrl: wallpapers.thumbUrl,
      width: wallpapers.width,
      height: wallpapers.height,
    })
    .from(collectionWallpapers)
    .innerJoin(wallpapers, eq(collectionWallpapers.wallpaperId, wallpapers.id))
    .where(
      and(
        eq(collectionWallpapers.collectionId, row.id),
        eq(wallpapers.status, "active")
      )
    )
    .orderBy(asc(collectionWallpapers.sortOrder));

  let savedByUser = false;
  if (viewerUserId) {
    const [saved] = await db
      .select({ id: collectionSaves.id })
      .from(collectionSaves)
      .where(
        and(
          eq(collectionSaves.collectionId, row.id),
          eq(collectionSaves.userId, viewerUserId)
        )
      )
      .limit(1);
    savedByUser = Boolean(saved);
  }

  await db
    .update(collections)
    .set({ viewCount: sql`${collections.viewCount} + 1` })
    .where(eq(collections.id, row.id));

  const { id, ...collectionFields } = row;
  return {
    collection: {
      id,
      slug: collectionFields.slug,
      name: collectionFields.name,
      description: collectionFields.description,
      category: collectionFields.category,
      featured: collectionFields.featured,
      saveCount: collectionFields.saveCount,
      viewCount: collectionFields.viewCount,
      wallpaperCount: collectionFields.wallpaperCount,
      status: collectionFields.status,
      userId: collectionFields.userId,
      createdAt: collectionFields.createdAt,
      updatedAt: collectionFields.updatedAt,
    },
    curatorUsername: collectionFields.curatorUsername,
    curatorAvatar: collectionFields.curatorAvatar,
    curatorNickname: collectionFields.curatorNickname,
    wallpapers: wallpaperRows,
    savedByUser,
  };
}

export async function toggleCollectionSave(collectionId: number, userId: number) {
  const [existing] = await db
    .select({ id: collectionSaves.id })
    .from(collectionSaves)
    .where(
      and(
        eq(collectionSaves.collectionId, collectionId),
        eq(collectionSaves.userId, userId)
      )
    )
    .limit(1);

  if (existing) {
    await db.delete(collectionSaves).where(eq(collectionSaves.id, existing.id));
    await db
      .update(collections)
      .set({ saveCount: sql`GREATEST(${collections.saveCount} - 1, 0)` })
      .where(eq(collections.id, collectionId));
    return { saved: false };
  }

  await db.insert(collectionSaves).values({ collectionId, userId });
  await db
    .update(collections)
    .set({ saveCount: sql`${collections.saveCount} + 1` })
    .where(eq(collections.id, collectionId));
  return { saved: true };
}

export async function countCollections(filter = "All", q?: string) {
  const conditions = [eq(collections.status, "active")];
  if (filter && filter !== "All") {
    conditions.push(eq(collections.category, filter));
  }
  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    conditions.push(
      or(
        ilike(collections.name, term),
        ilike(collections.description, term),
        ilike(users.username, term)
      )!
    );
  }

  const [result] = await db
    .select({ n: count() })
    .from(collections)
    .innerJoin(users, eq(collections.userId, users.id))
    .where(and(...conditions));

  return result?.n ?? 0;
}
