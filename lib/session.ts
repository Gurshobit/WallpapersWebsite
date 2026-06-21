import { headers } from "next/headers";
import { auth } from "./auth";
import { getUserByAuthId } from "./db/queries/users";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return getUserByAuthId(session.user.id);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.roleId !== 1) throw new Error("Forbidden");
  return user;
}
