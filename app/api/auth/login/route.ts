import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { authUser } from "@/lib/db/schema";
import {
  syncAuthAccountFromUser,
  verifyUserPasswordByEmail,
} from "@/lib/user-password";
import { forwardAuthResponse } from "@/lib/auth-response";
import { getMemberSettings } from "@/lib/member-settings";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Login verifies against hdwallsite_users.password_hash first,
 * syncs auth_account, then creates a Better Auth session.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = schema.parse(await req.json());

    const valid = await verifyUserPasswordByEmail(email, password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const settings = await getMemberSettings();
    if (settings.requireConfirmation) {
      const [authRecord] = await db
        .select({ emailVerified: authUser.emailVerified })
        .from(authUser)
        .where(eq(authUser.email, email))
        .limit(1);

      if (authRecord && !authRecord.emailVerified) {
        return NextResponse.json(
          { error: "Please verify your email before signing in." },
          { status: 403 }
        );
      }
    }

    await syncAuthAccountFromUser(email);

    const res = await auth.api.signInEmail({
      body: { email, password },
      headers: req.headers,
      asResponse: true,
    });

    return forwardAuthResponse(res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
