import { eq } from "drizzle-orm";
import { db } from "../index";
import {
  userNotifs,
  userPrivacy,
  userProfiles,
  users,
} from "../schema";

export type PrivacyLevel = "everyone" | "only_me" | "logged_members";

export type AccountSettings = {
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    nickname: string;
    biography: string;
    location: string;
    interests: string;
    urlHomepage: string;
    urlTwitter: string;
    urlFacebook: string;
    urlLinkedin: string;
  };
  privacy: {
    showAuthor: boolean;
    viewProfile: PrivacyLevel;
    viewContactInfo: PrivacyLevel;
    viewBio: PrivacyLevel;
    viewDownloads: PrivacyLevel;
    viewFavourites: PrivacyLevel;
    viewWallpapers: PrivacyLevel;
  };
  notifications: {
    emailOnComment: boolean;
    emailOnFollow: boolean;
    emailOnLike: boolean;
  };
};

const PRIVACY_DEFAULT: AccountSettings["privacy"] = {
  showAuthor: false,
  viewProfile: "everyone",
  viewContactInfo: "everyone",
  viewBio: "everyone",
  viewDownloads: "everyone",
  viewFavourites: "everyone",
  viewWallpapers: "everyone",
};

export async function getAccountSettings(userId: number): Promise<AccountSettings | null> {
  const [user] = await db
    .select({
      email: users.email,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      nickname: userProfiles.nickname,
      biography: userProfiles.biography,
      location: userProfiles.location,
      interests: userProfiles.interests,
      urlHomepage: userProfiles.urlHomepage,
      urlTwitter: userProfiles.urlTwitter,
      urlFacebook: userProfiles.urlFacebook,
      urlLinkedin: userProfiles.urlLinkedin,
      showAuthor: userPrivacy.showAuthor,
      viewProfile: userPrivacy.viewProfile,
      viewContactInfo: userPrivacy.viewContactInfo,
      viewBio: userPrivacy.viewBio,
      viewDownloads: userPrivacy.viewDownloads,
      viewFavourites: userPrivacy.viewFavourites,
      viewWallpapers: userPrivacy.viewWallpapers,
      emailOnComment: userNotifs.emailOnComment,
      emailOnFollow: userNotifs.emailOnFollow,
      emailOnLike: userNotifs.emailOnLike,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .leftJoin(userPrivacy, eq(users.id, userPrivacy.userId))
    .leftJoin(userNotifs, eq(users.id, userNotifs.userId))
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  return {
    email: user.email ?? "",
    profile: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      nickname: user.nickname ?? "",
      biography: user.biography ?? "",
      location: user.location ?? "",
      interests: user.interests ?? "",
      urlHomepage: user.urlHomepage ?? "",
      urlTwitter: user.urlTwitter ?? "",
      urlFacebook: user.urlFacebook ?? "",
      urlLinkedin: user.urlLinkedin ?? "",
    },
    privacy: {
      showAuthor: user.showAuthor ?? PRIVACY_DEFAULT.showAuthor,
      viewProfile: (user.viewProfile ?? PRIVACY_DEFAULT.viewProfile) as PrivacyLevel,
      viewContactInfo: (user.viewContactInfo ??
        PRIVACY_DEFAULT.viewContactInfo) as PrivacyLevel,
      viewBio: (user.viewBio ?? PRIVACY_DEFAULT.viewBio) as PrivacyLevel,
      viewDownloads: (user.viewDownloads ??
        PRIVACY_DEFAULT.viewDownloads) as PrivacyLevel,
      viewFavourites: (user.viewFavourites ??
        PRIVACY_DEFAULT.viewFavourites) as PrivacyLevel,
      viewWallpapers: (user.viewWallpapers ??
        PRIVACY_DEFAULT.viewWallpapers) as PrivacyLevel,
    },
    notifications: {
      emailOnComment: user.emailOnComment ?? true,
      emailOnFollow: user.emailOnFollow ?? true,
      emailOnLike: user.emailOnLike ?? false,
    },
  };
}

export async function upsertProfile(
  userId: number,
  data: AccountSettings["profile"]
) {
  const [existing] = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const values = {
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    nickname: data.nickname || null,
    biography: data.biography || null,
    location: data.location || null,
    interests: data.interests || null,
    urlHomepage: data.urlHomepage || null,
    urlTwitter: data.urlTwitter || null,
    urlFacebook: data.urlFacebook || null,
    urlLinkedin: data.urlLinkedin || null,
  };

  if (existing) {
    await db.update(userProfiles).set(values).where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, ...values });
  }
}

export async function upsertPrivacy(
  userId: number,
  data: AccountSettings["privacy"]
) {
  const [existing] = await db
    .select({ userId: userPrivacy.userId })
    .from(userPrivacy)
    .where(eq(userPrivacy.userId, userId))
    .limit(1);

  if (existing) {
    await db.update(userPrivacy).set(data).where(eq(userPrivacy.userId, userId));
  } else {
    await db.insert(userPrivacy).values({ userId, ...data });
  }
}

export async function upsertNotifications(
  userId: number,
  data: AccountSettings["notifications"]
) {
  const [existing] = await db
    .select({ userId: userNotifs.userId })
    .from(userNotifs)
    .where(eq(userNotifs.userId, userId))
    .limit(1);

  if (existing) {
    await db.update(userNotifs).set(data).where(eq(userNotifs.userId, userId));
  } else {
    await db.insert(userNotifs).values({ userId, ...data });
  }
}
