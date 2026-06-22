import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
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
import {
  assertCanRegister,
  assertUsernameAllowed,
  getMemberSettings,
} from "@/lib/member-settings";
import { forwardAuthResponse } from "@/lib/auth-response";
import { hashPasswordForStorage } from "@/lib/user-password";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9_]+$/),
});

export async function POST(req: NextRequest) {
  try {
    await assertCanRegister();
    const body = schema.parse(await req.json());
    await assertUsernameAllowed(body.username);

    const settings = await getMemberSettings();

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

    const [existingAuth] = await db
      .select({ id: authUser.id })
      .from(authUser)
      .where(eq(authUser.email, body.email))
      .limit(1);
    if (existingAuth) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashed = await hashPasswordForStorage(body.password);
    const authId = randomUUID();
    const emailVerified = !settings.requireConfirmation;
    const userStatus = settings.requireConfirmation ? "pending" : "active";

    await db.insert(authUser).values({
      id: authId,
      name: body.username,
      email: body.email,
      emailVerified,
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
        roleId: 2,
        username: body.username,
        email: body.email,
        passwordHash: hashed,
        status: userStatus,
      })
      .returning();

    await db.insert(userProfiles).values({ userId: user.id, nickname: body.username });
    await db.insert(userPrivacy).values({ userId: user.id });
    await db.insert(userStats).values({ userId: user.id });
    await db.insert(userNotifs).values({ userId: user.id });

    if (settings.requireConfirmation) {
      return NextResponse.json({
        ok: true,
        needsVerification: true,
        message: "Check your email to verify your account before signing in.",
      });
    }

    const res = await auth.api.signInEmail({
      body: { email: body.email, password: body.password },
      headers: req.headers,
      asResponse: true,
    });

    return forwardAuthResponse(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const status =
      message.includes("closed") || message.includes("not available")
        ? 403
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
