import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/session";
import {
  getAccountSettings,
  upsertNotifications,
  upsertPrivacy,
  upsertProfile,
  type PrivacyLevel,
} from "@/lib/db/queries/account";
import { db } from "@/lib/db";
import { authUser, users } from "@/lib/db/schema";
import {
  updateUserPassword,
  verifyUserPasswordByEmail,
} from "@/lib/user-password";

const privacyLevel = z.enum(["everyone", "only_me", "logged_members"]);

const profileSchema = z.object({
  section: z.literal("profile"),
  firstName: z.string().max(255).optional().default(""),
  lastName: z.string().max(255).optional().default(""),
  nickname: z.string().max(255).optional().default(""),
  biography: z.string().max(5000).optional().default(""),
  location: z.string().max(255).optional().default(""),
  interests: z.string().max(255).optional().default(""),
  urlHomepage: z.string().max(255).optional().default(""),
  urlTwitter: z.string().max(255).optional().default(""),
  urlFacebook: z.string().max(255).optional().default(""),
  urlLinkedin: z.string().max(255).optional().default(""),
});

const privacySchema = z.object({
  section: z.literal("privacy"),
  showAuthor: z.boolean(),
  viewProfile: privacyLevel,
  viewContactInfo: privacyLevel,
  viewBio: privacyLevel,
  viewDownloads: privacyLevel,
  viewFavourites: privacyLevel,
  viewWallpapers: privacyLevel,
});

const notificationsSchema = z.object({
  section: z.literal("notifications"),
  emailOnComment: z.boolean(),
  emailOnFollow: z.boolean(),
  emailOnLike: z.boolean(),
});

const passwordSchema = z.object({
  section: z.literal("password"),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const emailSchema = z.object({
  section: z.literal("email"),
  newEmail: z.string().email(),
  currentPassword: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const settings = await getAccountSettings(user.id);
    if (!settings) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const section = body?.section as string;

    if (section === "profile") {
      const data = profileSchema.parse(body);
      await upsertProfile(user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname,
        biography: data.biography,
        location: data.location,
        interests: data.interests,
        urlHomepage: data.urlHomepage,
        urlTwitter: data.urlTwitter,
        urlFacebook: data.urlFacebook,
        urlLinkedin: data.urlLinkedin,
      });
      return NextResponse.json({ ok: true });
    }

    if (section === "privacy") {
      const data = privacySchema.parse(body);
      await upsertPrivacy(user.id, {
        showAuthor: data.showAuthor,
        viewProfile: data.viewProfile as PrivacyLevel,
        viewContactInfo: data.viewContactInfo as PrivacyLevel,
        viewBio: data.viewBio as PrivacyLevel,
        viewDownloads: data.viewDownloads as PrivacyLevel,
        viewFavourites: data.viewFavourites as PrivacyLevel,
        viewWallpapers: data.viewWallpapers as PrivacyLevel,
      });
      return NextResponse.json({ ok: true });
    }

    if (section === "notifications") {
      const data = notificationsSchema.parse(body);
      await upsertNotifications(user.id, {
        emailOnComment: data.emailOnComment,
        emailOnFollow: data.emailOnFollow,
        emailOnLike: data.emailOnLike,
      });
      return NextResponse.json({ ok: true });
    }

    if (section === "password") {
      const data = passwordSchema.parse(body);
      if (!user.email) {
        return NextResponse.json({ error: "No email on account" }, { status: 400 });
      }
      const valid = await verifyUserPasswordByEmail(user.email, data.currentPassword);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      await updateUserPassword(user.email, data.newPassword);
      return NextResponse.json({ ok: true });
    }

    if (section === "email") {
      const data = emailSchema.parse(body);
      if (!user.email) {
        return NextResponse.json({ error: "No email on account" }, { status: 400 });
      }
      const valid = await verifyUserPasswordByEmail(user.email, data.currentPassword);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const [taken] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.newEmail))
        .limit(1);
      if (taken && taken.id !== user.id) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }

      await db
        .update(users)
        .set({ email: data.newEmail })
        .where(eq(users.id, user.id));

      if (user.authUserId) {
        await db
          .update(authUser)
          .set({ email: data.newEmail })
          .where(eq(authUser.id, user.authUserId));
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
