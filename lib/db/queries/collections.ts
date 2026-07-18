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

function slugifyCollection(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export async function listCollectionsByUser(
  ownerUserId: number,
  viewerUserId?: number
) {
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
    .where(
      and(eq(collections.userId, ownerUserId), eq(collections.status, "active"))
    )
    .orderBy(desc(collections.saveCount));

  const withThumbs = await attachThumbs(rows);
  if (!viewerUserId) return withThumbs;

  const saved = await db
    .select({ collectionId: collectionSaves.collectionId })
    .from(collectionSaves)
    .where(eq(collectionSaves.userId, viewerUserId));
  const savedSet = new Set(saved.map((s) => s.collectionId));
  return withThumbs.map((item) => ({
    ...item,
    savedByUser: savedSet.has(item.id),
  }));
}

export async function createCollection({
  userId,
  name,
  description,
  category,
  featured = false,
}: {
  userId: number;
  name: string;
  description?: string;
  category?: string;
  featured?: boolean;
}) {
  const base = slugifyCollection(name) || "collection";
  let slug = base;
  let n = 0;
  while (true) {
    const [existing] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(eq(collections.slug, slug))
      .limit(1);
    if (!existing) break;
    n += 1;
    slug = `${base}-${n}`;
  }

  const [row] = await db
    .insert(collections)
    .values({
      userId,
      name,
      slug,
      description: description || null,
      category: category || null,
      featured,
      status: "active",
    })
    .returning();

  return row;
}

export async function updateCollection(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    category?: string | null;
    featured?: boolean;
    status?: string;
  },
  opts?: { requireOwnerId?: number; admin?: boolean }
) {
  const [existing] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);
  if (!existing) return null;
  if (opts?.requireOwnerId && existing.userId !== opts.requireOwnerId && !opts.admin) {
    throw new Error("Forbidden");
  }

  const patch: Partial<typeof collections.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (data.name !== undefined) patch.name = data.name;
  if (data.description !== undefined) patch.description = data.description;
  if (data.category !== undefined) patch.category = data.category;
  if (data.featured !== undefined) patch.featured = data.featured;
  if (data.status !== undefined) patch.status = data.status;

  const [row] = await db
    .update(collections)
    .set(patch)
    .where(eq(collections.id, id))
    .returning();
  return row;
}

export async function deleteCollection(
  id: number,
  opts?: { requireOwnerId?: number; admin?: boolean }
) {
  const [existing] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, id))
    .limit(1);
  if (!existing) return false;
  if (opts?.requireOwnerId && existing.userId !== opts.requireOwnerId && !opts.admin) {
    throw new Error("Forbidden");
  }
  await db.delete(collections).where(eq(collections.id, id));
  return true;
}

export async function addWallpaperToCollection(
  collectionId: number,
  wallpaperId: number,
  ownerUserId?: number
) {
  const [col] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId))
    .limit(1);
  if (!col) throw new Error("Collection not found");
  if (ownerUserId && col.userId !== ownerUserId) throw new Error("Forbidden");

  const [exists] = await db
    .select({ id: collectionWallpapers.id })
    .from(collectionWallpapers)
    .where(
      and(
        eq(collectionWallpapers.collectionId, collectionId),
        eq(collectionWallpapers.wallpaperId, wallpaperId)
      )
    )
    .limit(1);
  if (exists) return { added: false };

  await db.insert(collectionWallpapers).values({ collectionId, wallpaperId });
  await db
    .update(collections)
    .set({
      wallpaperCount: sql`${collections.wallpaperCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(collections.id, collectionId));
  return { added: true };
}

export async function removeWallpaperFromCollection(
  collectionId: number,
  wallpaperId: number,
  ownerUserId?: number
) {
  const [col] = await db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId))
    .limit(1);
  if (!col) throw new Error("Collection not found");
  if (ownerUserId && col.userId !== ownerUserId) throw new Error("Forbidden");

  const deleted = await db
    .delete(collectionWallpapers)
    .where(
      and(
        eq(collectionWallpapers.collectionId, collectionId),
        eq(collectionWallpapers.wallpaperId, wallpaperId)
      )
    )
    .returning({ id: collectionWallpapers.id });

  if (deleted.length > 0) {
    await db
      .update(collections)
      .set({
        wallpaperCount: sql`GREATEST(${collections.wallpaperCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, collectionId));
  }
  return { removed: deleted.length > 0 };
}

export async function adminListCollections(q?: string, limit = 100) {
  const conditions = [];
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

  return db
    .select({
      id: collections.id,
      slug: collections.slug,
      name: collections.name,
      description: collections.description,
      category: collections.category,
      featured: collections.featured,
      status: collections.status,
      saveCount: collections.saveCount,
      viewCount: collections.viewCount,
      wallpaperCount: collections.wallpaperCount,
      curatorUsername: users.username,
      createdAt: collections.createdAt,
    })
    .from(collections)
    .innerJoin(users, eq(collections.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(collections.createdAt))
    .limit(limit);
}
