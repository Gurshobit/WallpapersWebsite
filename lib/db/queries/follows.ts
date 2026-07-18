import { and, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { follows, userStats, users } from "../schema";

export async function isFollowing(followerId: number, followingId: number) {
  const [row] = await db
    .select({ followerId: follows.followerId })
    .from(follows)
    .where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      )
    )
    .limit(1);
  return Boolean(row);
}

export async function toggleFollow(followerId: number, followingId: number) {
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself");
  }

  const [target] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, followingId), eq(users.status, "active")))
    .limit(1);
  if (!target) throw new Error("User not found");

  const existing = await isFollowing(followerId, followingId);

  if (existing) {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    await db
      .update(userStats)
      .set({
        followerCount: sql`GREATEST(COALESCE(${userStats.followerCount}, 0) - 1, 0)`,
      })
      .where(eq(userStats.userId, followingId));
    return { following: false };
  }

  await db.insert(follows).values({ followerId, followingId });

  const [stats] = await db
    .select({ userId: userStats.userId })
    .from(userStats)
    .where(eq(userStats.userId, followingId))
    .limit(1);

  if (stats) {
    await db
      .update(userStats)
      .set({
        followerCount: sql`COALESCE(${userStats.followerCount}, 0) + 1`,
      })
      .where(eq(userStats.userId, followingId));
  } else {
    await db.insert(userStats).values({ userId: followingId, followerCount: 1 });
  }

  return { following: true };
}

export async function getFollowingIds(followerId: number, userIds: number[]) {
  if (userIds.length === 0) return new Set<number>();
  const rows = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, followerId));
  const set = new Set(rows.map((r) => r.followingId));
  return new Set(userIds.filter((id) => set.has(id)));
}
