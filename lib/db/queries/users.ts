import { eq, and } from "drizzle-orm";
import { db } from "../index";
import {
  users,
  userProfiles,
  userStats,
  userPrivacy,
} from "../schema";

export type UserProfileData = {
  user: typeof users.$inferSelect;
  profile: typeof userProfiles.$inferSelect | null;
  stats: typeof userStats.$inferSelect | null;
  privacy: typeof userPrivacy.$inferSelect | null;
};

export async function getUserByUsername(
  username: string
): Promise<UserProfileData | null> {
  const [user] = await db
    .select({
      user: users,
      profile: userProfiles,
      stats: userStats,
      privacy: userPrivacy,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .leftJoin(userStats, eq(users.id, userStats.userId))
    .leftJoin(userPrivacy, eq(users.id, userPrivacy.userId))
    .where(and(eq(users.username, username), eq(users.status, "active")))
    .limit(1);

  return user ?? null;
}

export async function getUserByAuthId(authUserId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUserId))
    .limit(1);
  return user ?? null;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user ?? null;
}

export async function linkAuthUser(
  authUserId: string,
  email: string,
  name: string
) {
  const username = name.toLowerCase().replace(/\s+/g, "_").slice(0, 50);
  const [user] = await db
    .insert(users)
    .values({
      authUserId,
      username: `${username}_${Date.now().toString(36)}`,
      email,
      roleId: 2,
      status: "active",
    })
    .returning();
  return user;
}

export async function getSessionUser(authUserId: string | undefined) {
  if (!authUserId) return null;
  return getUserByAuthId(authUserId);
}
