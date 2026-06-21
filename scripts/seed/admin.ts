import { db } from "../../lib/db";
import {
  users,
  userProfiles,
  userPrivacy,
  userStats,
  userNotifs,
  userRoles,
  authUser,
  authAccount,
} from "../../lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  hashPasswordForStorage,
  updateUserPassword,
} from "../../lib/user-password";

export async function seedRoles() {
  const roles = [
    { id: 1, name: "admin", description: "Site administrator" },
    { id: 2, name: "user", description: "Regular member" },
    { id: 3, name: "moderator", description: "Content moderator" },
  ];
  for (const role of roles) {
    await db.insert(userRoles).values(role).onConflictDoNothing();
  }
  console.log("Seeded user roles");
}

export async function seedAdmin() {
  const email = "brargurshobit2009@gmail.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme";

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await updateUserPassword(email, password);
    console.log(`Admin user already exists — password updated (bcrypt): ${email}`);
    return;
  }

  const authId = randomUUID();
  const hashed = await hashPasswordForStorage(password);

  await db.insert(authUser).values({
    id: authId,
    name: "admin",
    email,
    emailVerified: true,
  });

  await db.insert(authAccount).values({
    id: randomUUID(),
    accountId: authId,
    providerId: "credential",
    userId: authId,
    password: hashed,
  });

  const [user] = await db
    .insert(users)
    .values({
      authUserId: authId,
      roleId: 1,
      username: "admin",
      email,
      passwordHash: hashed,
      status: "active",
    })
    .returning();

  await db.insert(userProfiles).values({ userId: user.id });
  await db.insert(userPrivacy).values({ userId: user.id });
  await db.insert(userStats).values({ userId: user.id });
  await db.insert(userNotifs).values({ userId: user.id });

  console.log(`Seeded admin user: ${email}`);
  console.log(`  Password: ${password} (bcrypt)`);
}
