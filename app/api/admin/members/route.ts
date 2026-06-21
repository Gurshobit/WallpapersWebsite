import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import {
  authAccount,
  authUser,
  userNotifs,
  userPrivacy,
  userProfiles,
  userStats,
  users,
} from "@/lib/db/schema";
import { hashPasswordForStorage } from "@/lib/user-password";
import {
  getMemberSettings,
  isUsernameRestricted,
} from "@/lib/member-settings";

const schema = z.object({
  username: z.string().min(3).max(100).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  status: z.enum(["active", "pending", "suspended"]).default("active"),
  roleId: z.number().int().min(1).max(3).default(2),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());

    const { restrictedUsernames } = await getMemberSettings();

    if (isUsernameRestricted(body.username, restrictedUsernames)) {
      return NextResponse.json({ error: "Username is restricted" }, { status: 400 });
    }

    const [existingEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);
    if (existingEmail) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, body.username))
      .limit(1);
    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const hashed = await hashPasswordForStorage(body.password);
    const authId = randomUUID();

    await db.insert(authUser).values({
      id: authId,
      name: body.username,
      email: body.email,
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
        roleId: body.roleId,
        username: body.username,
        email: body.email,
        passwordHash: hashed,
        status: body.status,
      })
      .returning();

    await db.insert(userProfiles).values({ userId: user.id, nickname: body.username });
    await db.insert(userPrivacy).values({ userId: user.id });
    await db.insert(userStats).values({ userId: user.id });
    await db.insert(userNotifs).values({ userId: user.id });

    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
