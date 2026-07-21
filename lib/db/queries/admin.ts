import { eq, desc, count, and, or, sql, asc, gte, lt, lte, isNull } from "drizzle-orm";
import { db } from "../index";
import {
  wallpapers,
  wallpaperComments,
  wallpaperCommentsReported,
  moderationQueue,
  users,
  categories,
  userProfiles,
  userStats,
  languages,
  adSlots,
  siteConfigs,
  resolutions,
  resolutionTypes,
  licenses,
  downloads,
  views,
  ratings,
  topDownloads,
  topPopular,
  wallpaperImages,
} from "../schema";

export async function getAdminOverview() {
  const [pendingWalls] = await db
    .select({ count: count() })
    .from(wallpapers)
    .where(eq(wallpapers.status, "pending"));

  const [pendingComments] = await db
    .select({ count: count() })
    .from(wallpaperComments)
    .where(eq(wallpaperComments.status, "pending"));

  const [reportedComments] = await db
    .select({ count: count() })
    .from(wallpaperCommentsReported);

  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [activeWalls] = await db
    .select({ count: count() })
    .from(wallpapers)
    .where(eq(wallpapers.status, "active"));

  const topCategories = await db
    .select({ name: categories.name, total: categories.totalWallpapers })
    .from(categories)
    .orderBy(desc(categories.totalWallpapers))
    .limit(5);

  return {
    pendingWallpapers: pendingWalls?.count ?? 0,
    pendingComments: pendingComments?.count ?? 0,
    reportedComments: reportedComments?.count ?? 0,
    totalUsers: totalUsers?.count ?? 0,
    activeWallpapers: activeWalls?.count ?? 0,
    topCategories,
  };
}

export async function getModerationQueue() {
  return db
    .select({
      queue: moderationQueue,
      wallpaper: wallpapers,
      comment: wallpaperComments,
    })
    .from(moderationQueue)
    .leftJoin(wallpapers, eq(moderationQueue.wallpaperId, wallpapers.id))
    .leftJoin(
      wallpaperComments,
      eq(moderationQueue.commentId, wallpaperComments.id)
    )
    .where(eq(moderationQueue.status, "pending"))
    .orderBy(desc(moderationQueue.createdAt));
}

export async function getPendingModerationItems() {
  return db
    .select({
      wallpaper: wallpapers,
      username: users.username,
      avatarUrl: users.avatarUrl,
      categoryName: categories.name,
    })
    .from(wallpapers)
    .innerJoin(users, eq(wallpapers.userId, users.id))
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .where(eq(wallpapers.status, "pending"))
    .orderBy(desc(wallpapers.dateAdded))
    .limit(50);
}

export async function listAdminWallpapersEnhanced({
  status,
  q,
  sort = "latest",
  limit = 50,
}: {
  status?: string;
  q?: string;
  sort?: "latest" | "downloads" | "title";
  limit?: number;
}) {
  const conditions = [];
  if (status) conditions.push(eq(wallpapers.status, status as typeof wallpapers.status.enumValues[number]));
  if (q?.trim()) {
    conditions.push(
      sql`(${wallpapers.title} ILIKE ${`%${q.trim()}%`} OR ${users.username} ILIKE ${`%${q.trim()}%`})`
    );
  }

  const order =
    sort === "title"
      ? asc(wallpapers.title)
      : sort === "downloads"
        ? desc(topDownloads.all)
        : desc(wallpapers.dateAdded);

  return db
    .select({
      wallpaper: wallpapers,
      username: users.username,
      avatarUrl: users.avatarUrl,
      categoryName: categories.name,
      downloadCount: topDownloads.all,
    })
    .from(wallpapers)
    .innerJoin(users, eq(wallpapers.userId, users.id))
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .leftJoin(topDownloads, eq(topDownloads.wallpaperId, wallpapers.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(order)
    .limit(limit);
}

export async function listAdminUsersEnhanced(q?: string, limit = 50) {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const conditions = q?.trim()
    ? sql`(${users.username} ILIKE ${`%${q.trim()}%`} OR ${users.email} ILIKE ${`%${q.trim()}%`})`
    : undefined;

  const rows = await db
    .select({
      user: users,
      nickname: userProfiles.nickname,
      uploadsActive: userStats.uploadsActive,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .leftJoin(userStats, eq(users.id, userStats.userId))
    .where(conditions)
    .orderBy(desc(users.dateRegistered))
    .limit(limit);

  const [[totalUsers], [creators], [suspended], [newWeek]] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(users).where(gte(users.totalUploads, 1)),
    db.select({ n: count() }).from(users).where(eq(users.status, "suspended")),
    db.select({ n: count() }).from(users).where(gte(users.dateRegistered, since7d)),
  ]);

  return {
    rows,
    stats: {
      total: totalUsers?.n ?? 0,
      creators: creators?.n ?? 0,
      suspended: suspended?.n ?? 0,
      newWeek: newWeek?.n ?? 0,
    },
  };
}

export async function updateAdminUser(
  userId: number,
  data: { status?: string; roleId?: number }
) {
  const patch: { status?: typeof users.status.enumValues[number]; roleId?: number } = {};
  if (data.status) {
    patch.status = data.status as typeof users.status.enumValues[number];
  }
  if (data.roleId !== undefined) patch.roleId = data.roleId;

  const [updated] = await db
    .update(users)
    .set(patch)
    .where(eq(users.id, userId))
    .returning();

  return updated ?? null;
}

export async function getAdminWallpaperDetail(wallpaperId: number) {
  const [row] = await db
    .select({
      wallpaper: wallpapers,
      username: users.username,
      categoryName: categories.name,
    })
    .from(wallpapers)
    .innerJoin(users, eq(wallpapers.userId, users.id))
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .where(eq(wallpapers.id, wallpaperId))
    .limit(1);

  if (!row) return null;

  const images = await db
    .select({
      id: wallpaperImages.id,
      url: wallpaperImages.url,
      format: wallpaperImages.format,
      width: wallpaperImages.width,
      height: wallpaperImages.height,
      fileSize: wallpaperImages.fileSize,
      status: wallpaperImages.status,
      resolutionName: resolutions.name,
      typeName: resolutionTypes.name,
    })
    .from(wallpaperImages)
    .leftJoin(resolutions, eq(wallpaperImages.resolutionId, resolutions.id))
    .leftJoin(resolutionTypes, eq(resolutions.typeId, resolutionTypes.id))
    .where(eq(wallpaperImages.wallpaperId, wallpaperId))
    .orderBy(desc(wallpaperImages.width), asc(wallpaperImages.format));

  return { ...row, images };
}

export async function updateAdminWallpaper(
  wallpaperId: number,
  data: {
    title?: string;
    description?: string;
    status?: string;
    featured?: boolean;
    categoryId?: number;
    tags?: string;
  }
) {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.description !== undefined) patch.description = data.description;
  if (data.featured !== undefined) patch.featured = data.featured;
  if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
  if (data.tags !== undefined) patch.tags = data.tags;
  if (data.status) {
    patch.status = data.status as typeof wallpapers.status.enumValues[number];
  }

  const [updated] = await db
    .update(wallpapers)
    .set(patch)
    .where(eq(wallpapers.id, wallpaperId))
    .returning();

  return updated ?? null;
}

export async function listAdminWallpapers(
  status?: string,
  cursor?: number,
  limit = 50
) {
  const conditions = status
    ? [eq(wallpapers.status, status as "pending")]
    : [];

  return db
    .select({
      wallpaper: wallpapers,
      username: users.username,
      categoryName: categories.name,
    })
    .from(wallpapers)
    .innerJoin(users, eq(wallpapers.userId, users.id))
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(wallpapers.dateAdded))
    .limit(limit)
    .offset(cursor ?? 0);
}

export async function moderateWallpaper(
  wallpaperId: number,
  action: "approve" | "reject",
  moderatorId: number,
  notes?: string
) {
  const status = action === "approve" ? "active" : "rejected";
  await db
    .update(wallpapers)
    .set({ status })
    .where(eq(wallpapers.id, wallpaperId));

  await db.insert(moderationQueue).values({
    wallpaperId,
    moderatorId,
    status: action === "approve" ? "approved" : "rejected",
    notes,
    resolvedAt: new Date(),
  });
}

export async function listUsers(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  return db
    .select()
    .from(users)
    .orderBy(desc(users.dateRegistered))
    .limit(limit)
    .offset(offset);
}

export async function listResolutionTypes() {
  return db
    .select()
    .from(resolutionTypes)
    .orderBy(asc(resolutionTypes.sortOrder), asc(resolutionTypes.id));
}

export async function listResolutions() {
  return db
    .select()
    .from(resolutions)
    .orderBy(asc(resolutions.typeId), asc(resolutions.sortOrder), asc(resolutions.id));
}

export async function listLicenses() {
  return db.select().from(licenses).orderBy(licenses.sortOrder);
}

export async function listLanguages() {
  return db.select().from(languages).orderBy(languages.code);
}

export async function listAdSlots() {
  return db.select().from(adSlots).orderBy(desc(adSlots.priority), adSlots.slug);
}

type AdSlotInsert = typeof adSlots.$inferInsert;

export async function getAdSlotBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(adSlots)
    .where(eq(adSlots.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function getAdSlotById(id: number) {
  const [row] = await db
    .select()
    .from(adSlots)
    .where(eq(adSlots.id, id))
    .limit(1);
  return row ?? null;
}

export async function createAdSlot(data: AdSlotInsert) {
  const [row] = await db.insert(adSlots).values(data).returning();
  return row;
}

export async function updateAdSlot(
  id: number,
  data: Partial<AdSlotInsert>
) {
  const [row] = await db
    .update(adSlots)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(adSlots.id, id))
    .returning();
  return row;
}

export async function deleteAdSlot(id: number) {
  await db.delete(adSlots).where(eq(adSlots.id, id));
}

/** Highest-priority active slot that is currently within its schedule window. */
export async function getActiveAdSlotByPlacement(placement: string) {
  const now = new Date();
  const [row] = await db
    .select()
    .from(adSlots)
    .where(
      and(
        eq(adSlots.placement, placement),
        eq(adSlots.active, true),
        or(isNull(adSlots.startsAt), lte(adSlots.startsAt, now)),
        or(isNull(adSlots.endsAt), gte(adSlots.endsAt, now))
      )
    )
    .orderBy(desc(adSlots.priority))
    .limit(1);
  return row ?? null;
}

export async function listCategories() {
  return db
    .select()
    .from(categories)
    .orderBy(categories.sortOrder, categories.id);
}

// ── ENGAGEMENT STATS ─────────────────────────────────────────────────────────

export async function getEngagementStats() {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [[dl7d], [dl30d], [v7d], [v30d], [likes7d]] = await Promise.all([
    db.select({ n: count() }).from(downloads).where(gte(downloads.dateDownloaded, since7d)),
    db.select({ n: count() }).from(downloads).where(gte(downloads.dateDownloaded, since30d)),
    db.select({ n: count() }).from(views).where(gte(views.dateViewed, since7d)),
    db.select({ n: count() }).from(views).where(gte(views.dateViewed, since30d)),
    db.select({ n: count() }).from(ratings)
      .where(and(eq(ratings.iLike, true), gte(ratings.dateVoted, since7d))),
  ]);

  const topDownloaded = await db
    .select({
      wallpaperId: topDownloads.wallpaperId,
      title: wallpapers.title,
      slug: wallpapers.slug,
      thumbUrl: wallpapers.thumbUrl,
      all: topDownloads.all,
      last7Days: topDownloads.last7Days,
      last30Days: topDownloads.last30Days,
    })
    .from(topDownloads)
    .innerJoin(wallpapers, eq(topDownloads.wallpaperId, wallpapers.id))
    .orderBy(desc(topDownloads.last30Days))
    .limit(5);

  const topViewed = await db
    .select({
      wallpaperId: topPopular.wallpaperId,
      title: wallpapers.title,
      slug: wallpapers.slug,
      thumbUrl: wallpapers.thumbUrl,
      all: topPopular.all,
      last7Days: topPopular.last7Days,
      last30Days: topPopular.last30Days,
    })
    .from(topPopular)
    .innerJoin(wallpapers, eq(topPopular.wallpaperId, wallpapers.id))
    .orderBy(desc(topPopular.last30Days))
    .limit(5);

  return {
    downloads: { last7Days: dl7d?.n ?? 0, last30Days: dl30d?.n ?? 0 },
    views:     { last7Days: v7d?.n  ?? 0, last30Days: v30d?.n  ?? 0 },
    likes:     { last7Days: likes7d?.n ?? 0 },
    topDownloaded,
    topViewed,
  };
}

// ── ACTIVITY LOG ─────────────────────────────────────────────────────────────

export async function getRecentActivity(limit = 40) {
  // Combine recent downloads and views into a single activity feed
  const recentDownloads = await db
    .select({
      type: sql<"download">`'download'`,
      wallpaperTitle: wallpapers.title,
      wallpaperSlug: wallpapers.slug,
      wallpaperThumb: wallpapers.thumbUrl,
      username: users.username,
      format: downloads.format,
      timestamp: downloads.dateDownloaded,
    })
    .from(downloads)
    .innerJoin(wallpapers, eq(downloads.wallpaperId, wallpapers.id))
    .leftJoin(users, eq(downloads.userId, users.id))
    .orderBy(desc(downloads.dateDownloaded))
    .limit(limit);

  const recentViews = await db
    .select({
      type: sql<"view">`'view'`,
      wallpaperTitle: wallpapers.title,
      wallpaperSlug: wallpapers.slug,
      wallpaperThumb: wallpapers.thumbUrl,
      username: users.username,
      format: sql<null>`null`,
      timestamp: views.dateViewed,
    })
    .from(views)
    .innerJoin(wallpapers, eq(views.wallpaperId, wallpapers.id))
    .leftJoin(users, eq(views.userId, users.id))
    .orderBy(desc(views.dateViewed))
    .limit(limit);

  const recentLikes = await db
    .select({
      type: sql<"like">`'like'`,
      wallpaperTitle: wallpapers.title,
      wallpaperSlug: wallpapers.slug,
      wallpaperThumb: wallpapers.thumbUrl,
      username: users.username,
      format: sql<null>`null`,
      timestamp: ratings.dateVoted,
    })
    .from(ratings)
    .innerJoin(wallpapers, eq(ratings.wallpaperId, wallpapers.id))
    .leftJoin(users, eq(ratings.userId, users.id))
    .where(eq(ratings.iLike, true))
    .orderBy(desc(ratings.dateVoted))
    .limit(20);

  const recentUploads = await db
    .select({
      type: sql<"upload">`'upload'`,
      wallpaperTitle: wallpapers.title,
      wallpaperSlug: wallpapers.slug,
      wallpaperThumb: wallpapers.thumbUrl,
      username: users.username,
      format: sql<null>`null`,
      timestamp: wallpapers.dateAdded,
    })
    .from(wallpapers)
    .innerJoin(users, eq(wallpapers.userId, users.id))
    .orderBy(desc(wallpapers.dateAdded))
    .limit(20);

  // Merge and sort by timestamp
  type ActivityEntry = {
    type: "download" | "view" | "like" | "upload";
    wallpaperTitle: string;
    wallpaperSlug: string | null;
    wallpaperThumb: string;
    username: string | null;
    format: string | null;
    timestamp: Date | null;
  };

  const merged: ActivityEntry[] = [
    ...recentDownloads.map(r => ({ ...r, type: "download" as const })),
    ...recentViews.map(r => ({ ...r, type: "view" as const })),
    ...recentLikes.map(r => ({ ...r, type: "like" as const })),
    ...recentUploads.map(r => ({ ...r, type: "upload" as const })),
  ]
    .sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0))
    .slice(0, limit);

  return merged;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardKpis() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    overview,
    [downloadsToday],
    [downloadsYesterday],
    [wallpapers7d],
    [users7d],
  ] = await Promise.all([
    getAdminOverview(),
    db
      .select({ n: count() })
      .from(downloads)
      .where(gte(downloads.dateDownloaded, todayStart)),
    db
      .select({ n: count() })
      .from(downloads)
      .where(
        and(
          gte(downloads.dateDownloaded, yesterdayStart),
          lt(downloads.dateDownloaded, todayStart)
        )
      ),
    db
      .select({ n: count() })
      .from(wallpapers)
      .where(gte(wallpapers.dateAdded, since7d)),
    db
      .select({ n: count() })
      .from(users)
      .where(gte(users.dateRegistered, since7d)),
  ]);

  return {
    ...overview,
    downloadsToday: downloadsToday?.n ?? 0,
    downloadsYesterday: downloadsYesterday?.n ?? 0,
    wallpapersAdded7d: wallpapers7d?.n ?? 0,
    usersAdded7d: users7d?.n ?? 0,
  };
}

export async function getWeeklyDownloadChart() {
  const today = startOfDay(new Date());
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  const rows = await db
    .select({ date: downloads.dateDownloaded })
    .from(downloads)
    .where(gte(downloads.dateDownloaded, weekStart));

  const buckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      count: 0,
      isToday: d.getTime() === today.getTime(),
    };
  });

  for (const row of rows) {
    if (!row.date) continue;
    const day = startOfDay(row.date);
    const index = Math.floor(
      (day.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000)
    );
    if (index >= 0 && index < 7) buckets[index].count += 1;
  }

  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const max = Math.max(...buckets.map((b) => b.count), 1);

  return {
    total,
    days: buckets.map((b) => ({
      ...b,
      heightPct: Math.round((b.count / max) * 100),
    })),
  };
}

export async function getTopCategoriesByDownloads(limit = 6) {
  const rows = await db
    .select({
      name: categories.name,
      total: count(),
    })
    .from(downloads)
    .innerJoin(wallpapers, eq(downloads.wallpaperId, wallpapers.id))
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .groupBy(categories.id, categories.name)
    .orderBy(desc(count()))
    .limit(limit);

  if (rows.length > 0) return rows;

  return db
    .select({ name: categories.name, total: categories.totalWallpapers })
    .from(categories)
    .orderBy(desc(categories.totalWallpapers))
    .limit(limit)
    .then((cats) =>
      cats.map((c) => ({ name: c.name, total: c.total ?? 0 }))
    );
}

const STORAGE_QUOTA_BYTES =
  Number(process.env.STORAGE_QUOTA_TB ?? 6) * 1_099_511_627_776;

export async function getStorageStats() {
  const [[originals], [variants], [thumbnails]] = await Promise.all([
    db
      .select({
        total: sql<number>`coalesce(sum(${wallpapers.fileSize}), 0)::int`,
      })
      .from(wallpapers),
    db
      .select({
        total: sql<number>`coalesce(sum(${wallpaperImages.fileSize}), 0)::int`,
      })
      .from(wallpaperImages)
      .where(sql`${wallpaperImages.width} > 512`),
    db
      .select({
        total: sql<number>`coalesce(sum(${wallpaperImages.fileSize}), 0)::int`,
      })
      .from(wallpaperImages)
      .where(sql`${wallpaperImages.width} <= 512`),
  ]);

  const originalsBytes = originals?.total ?? 0;
  const variantsBytes = variants?.total ?? 0;
  const thumbnailsBytes = thumbnails?.total ?? 0;
  const usedBytes = originalsBytes + variantsBytes + thumbnailsBytes;
  const quotaBytes = STORAGE_QUOTA_BYTES;

  return {
    usedBytes,
    quotaBytes,
    usedPct: quotaBytes > 0 ? Math.min(100, (usedBytes / quotaBytes) * 100) : 0,
    originalsBytes,
    variantsBytes,
    thumbnailsBytes,
  };
}

export async function getSiteConfigs() {
  return db.select().from(siteConfigs);
}

export async function updateSiteConfig(param: string, value: string) {
  await db
    .insert(siteConfigs)
    .values({ param, value })
    .onConflictDoUpdate({
      target: siteConfigs.param,
      set: { value },
    });
}
