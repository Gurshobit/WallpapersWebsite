import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getUserByAuthId } from "./db/queries/users";

export const ROLE = { admin: 1, user: 2, moderator: 3 } as const;

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
  if (user.roleId !== ROLE.admin) throw new Error("Forbidden");
  return user;
}

/** API guard: allow admins and moderators (staff). Throws "Forbidden" otherwise. */
export async function requireStaff() {
  const user = await requireAuth();
  if (user.roleId !== ROLE.admin && user.roleId !== ROLE.moderator) {
    throw new Error("Forbidden");
  }
  return user;
}

/** Page guard for /admin: allow staff (admin or moderator), redirect others. */
export async function guardAdminPage() {
  const user = await getCurrentUser();
  if (!user || (user.roleId !== ROLE.admin && user.roleId !== ROLE.moderator)) {
    redirect("/login");
  }
  return user;
}

/** Page guard for admin-only pages: moderators are redirected to Moderation. */
export async function guardAdminOnlyPage() {
  const user = await getCurrentUser();
  if (!user || (user.roleId !== ROLE.admin && user.roleId !== ROLE.moderator)) {
    redirect("/login");
  }
  if (user.roleId !== ROLE.admin) {
    redirect("/admin/moderation");
  }
  return user;
}
