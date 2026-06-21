import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { authAccount, users } from "./db/schema";
import { hashPassword, verifyPassword } from "./password";

async function setAuthCredentialPassword(authUserId: string, hashed: string) {
  const [account] = await db
    .select({ id: authAccount.id })
    .from(authAccount)
    .where(
      and(
        eq(authAccount.userId, authUserId),
        eq(authAccount.providerId, "credential")
      )
    )
    .limit(1);

  if (account) {
    await db
      .update(authAccount)
      .set({ password: hashed })
      .where(eq(authAccount.id, account.id));
    return;
  }

  await db.insert(authAccount).values({
    id: randomUUID(),
    accountId: authUserId,
    providerId: "credential",
    userId: authUserId,
    password: hashed,
  });
}

/** Hash with bcrypt and store in hdwallsite_users.password_hash + auth_account.password */
export async function updateUserPassword(
  email: string,
  password: string
): Promise<boolean> {
  const hashed = await hashPassword(password);

  const [user] = await db
    .select({ id: users.id, authUserId: users.authUserId })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return false;

  await db
    .update(users)
    .set({ passwordHash: hashed })
    .where(eq(users.id, user.id));

  if (user.authUserId) {
    await setAuthCredentialPassword(user.authUserId, hashed);
  }

  return true;
}

export async function hashPasswordForStorage(password: string): Promise<string> {
  return hashPassword(password);
}

/** Verify credentials against hdwallsite_users.password_hash (primary source). */
export async function verifyUserPasswordByEmail(
  email: string,
  plainPassword: string
): Promise<boolean> {
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user?.passwordHash) return false;
  return verifyPassword(user.passwordHash, plainPassword);
}

/** Ensure auth_account.password matches users.password_hash before Better Auth sign-in. */
export async function syncAuthAccountFromUser(email: string): Promise<void> {
  const [user] = await db
    .select({ authUserId: users.authUserId, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user?.authUserId || !user.passwordHash) return;
  await setAuthCredentialPassword(user.authUserId, user.passwordHash);
}

/** Copy auth_account bcrypt hash into users.password_hash (after Better Auth reset). */
export async function syncUserHashFromAuthAccount(authUserId: string): Promise<void> {
  const [account] = await db
    .select({ password: authAccount.password })
    .from(authAccount)
    .where(
      and(
        eq(authAccount.userId, authUserId),
        eq(authAccount.providerId, "credential")
      )
    )
    .limit(1);

  if (!account?.password) return;

  await db
    .update(users)
    .set({ passwordHash: account.password })
    .where(eq(users.authUserId, authUserId));
}
