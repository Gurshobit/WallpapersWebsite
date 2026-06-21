import { and, asc, count, desc, eq, gte } from "drizzle-orm";
import { db } from "../index";
import {
  categories,
  collectionWallpapers,
  collections,
  downloads,
  users,
  userProfiles,
  userStats,
  wallpaperComments,
  wallpapers,
  challenges,
} from "../schema";
import { formatCount } from "@/lib/format";

export async function getCommunityStats() {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [[members], [activeWalls], [totalDownloads], [newMembers]] =
    await Promise.all([
      db.select({ n: count() }).from(users).where(eq(users.status, "active")),
      db
        .select({ n: count() })
        .from(wallpapers)
        .where(eq(wallpapers.status, "active")),
      db.select({ n: count() }).from(downloads),
      db
        .select({ n: count() })
        .from(users)
        .where(gte(users.dateRegistered, since7d)),
    ]);

  return {
    members: members?.n ?? 0,
    membersFormatted: formatCount(members?.n ?? 0),
    wallpapers: activeWalls?.n ?? 0,
    wallpapersFormatted: formatCount(activeWalls?.n ?? 0),
    downloads: totalDownloads?.n ?? 0,
    downloadsFormatted: formatCount(totalDownloads?.n ?? 0),
    countries: 94,
    newMembers7d: newMembers?.n ?? 0,
  };
}

export type FeedItem =
  | {
      type: "upload";
      id: string;
      username: string;
      handle: string;
      avatarUrl: string | null;
      title: string;
      category: string;
      thumbUrl: string;
      wallpaperSlug: string | null;
      likes: number;
      downloads: number;
      timestamp: Date | null;
    }
  | {
      type: "comment";
      id: string;
      username: string;
      handle: string;
      avatarUrl: string | null;
      text: string;
      wallTitle: string;
      timestamp: Date | null;
    }
  | {
      type: "milestone";
      id: string;
      username: string;
      handle: string;
      avatarUrl: string | null;
      milestone: string;
      timestamp: Date | null;
    };

export async function getCommunityFeed(limit = 20): Promise<FeedItem[]> {
  const recentUploads = await db
    .select({
      id: wallpapers.id,
      title: wallpapers.title,
      slug: wallpapers.slug,
      thumbUrl: wallpapers.thumbUrl,
      username: users.username,
      avatarUrl: users.avatarUrl,
      categoryName: categories.name,
      ratingValue: wallpapers.ratingValue,
      dateAdded: wallpapers.dateAdded,
    })
    .from(wallpapers)
    .innerJoin(users, eq(wallpapers.userId, users.id))
    .innerJoin(categories, eq(wallpapers.categoryId, categories.id))
    .where(eq(wallpapers.status, "active"))
    .orderBy(desc(wallpapers.dateAdded))
    .limit(limit);

  const recentComments = await db
    .select({
      id: wallpaperComments.id,
      message: wallpaperComments.message,
      username: users.username,
      avatarUrl: users.avatarUrl,
      wallTitle: wallpapers.title,
      dateAdded: wallpaperComments.dateAdded,
    })
    .from(wallpaperComments)
    .innerJoin(users, eq(wallpaperComments.userId, users.id))
    .innerJoin(wallpapers, eq(wallpaperComments.wallpaperId, wallpapers.id))
    .where(eq(wallpaperComments.status, "active"))
    .orderBy(desc(wallpaperComments.dateAdded))
    .limit(10);

  const milestoneUsers = await db
    .select({
      userId: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      totalDownloads: users.totalDownloads,
      totalUploads: users.totalUploads,
    })
    .from(users)
    .where(and(eq(users.status, "active"), gte(users.totalDownloads, 1000)))
    .orderBy(desc(users.totalDownloads))
    .limit(5);

  const feed: FeedItem[] = [
    ...recentUploads.map((u) => ({
      type: "upload" as const,
      id: `upload-${u.id}`,
      username: u.username,
      handle: u.username,
      avatarUrl: u.avatarUrl,
      title: u.title,
      category: u.categoryName,
      thumbUrl: u.thumbUrl,
      wallpaperSlug: u.slug,
      likes: u.ratingValue,
      downloads: 0,
      timestamp: u.dateAdded,
    })),
    ...recentComments.map((c) => ({
      type: "comment" as const,
      id: `comment-${c.id}`,
      username: c.username,
      handle: c.username,
      avatarUrl: c.avatarUrl,
      text: c.message,
      wallTitle: c.wallTitle,
      timestamp: c.dateAdded,
    })),
    ...milestoneUsers.map((u) => ({
      type: "milestone" as const,
      id: `milestone-${u.userId}`,
      username: u.username,
      handle: u.username,
      avatarUrl: u.avatarUrl,
      milestone:
        u.totalDownloads >= 10000
          ? `${formatCount(u.totalDownloads)} downloads milestone reached!`
          : `Reached ${u.totalUploads} published wallpapers!`,
      timestamp: null,
    })),
  ];

  return feed
    .sort((a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0))
    .slice(0, limit);
}

export async function getTopCreators(limit = 10) {
  return db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      nickname: userProfiles.nickname,
      totalUploads: users.totalUploads,
      totalDownloads: users.totalDownloads,
      uploadsActive: userStats.uploadsActive,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .leftJoin(userStats, eq(users.id, userStats.userId))
    .where(and(eq(users.status, "active"), gte(users.totalUploads, 1)))
    .orderBy(desc(users.totalDownloads))
    .limit(limit);
}

export async function listChallenges(activeOnly = false) {
  const conditions = activeOnly ? [eq(challenges.active, true)] : [];
  return db
    .select()
    .from(challenges)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(challenges.active), desc(challenges.deadline));
}

export async function getFeaturedCommunityCollections(limit = 4) {
  const rows = await db
    .select({
      id: collections.id,
      slug: collections.slug,
      name: collections.name,
      description: collections.description,
      wallpaperCount: collections.wallpaperCount,
      curatorUsername: users.username,
      curatorAvatar: users.avatarUrl,
    })
    .from(collections)
    .innerJoin(users, eq(collections.userId, users.id))
    .where(and(eq(collections.status, "active"), eq(collections.featured, true)))
    .orderBy(desc(collections.saveCount))
    .limit(limit);

  const result = [];
  for (const row of rows) {
    const thumbs = await db
      .select({ thumbUrl: wallpapers.thumbUrl, uuid: wallpapers.uuid })
      .from(collectionWallpapers)
      .innerJoin(wallpapers, eq(collectionWallpapers.wallpaperId, wallpapers.id))
      .where(eq(collectionWallpapers.collectionId, row.id))
      .orderBy(asc(collectionWallpapers.sortOrder))
      .limit(3);

    result.push({
      ...row,
      thumbs: thumbs.map((t) => t.thumbUrl || t.uuid),
    });
  }
  return result;
}
