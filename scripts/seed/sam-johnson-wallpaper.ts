import { readFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { hashPasswordForStorage, updateUserPassword } from "../../lib/user-password";
import { db } from "../../lib/db";
import {
  users,
  userProfiles,
  userPrivacy,
  userStats,
  userNotifs,
  authUser,
  authAccount,
  categories,
  tags,
  wallpapers,
  wallpaperCategories,
  wallpaperTags,
  licenses,
} from "../../lib/db/schema";
import { originalKey, putObject } from "../../lib/r2";
import { processWallpaperVariants } from "../../lib/sharp";

const CREATOR_EMAIL = "sam.johnson@hdwallpapers.site";
const CREATOR_USERNAME = "sam_johnson";
const WALLPAPER_SLUG = "beautiful-city-night-view";
const WALLPAPER_TITLE = "Beautiful City Night View";
const TAG_NAMES = [
  "city",
  "night",
  "aerial",
  "urban",
  "skyline",
  "highway",
  "architecture",
  "cityscape",
  "lights",
  "nightscape",
];

function slugifyTag(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export async function seedCreatorSamJohnson() {
  const password = process.env.CREATOR_PASSWORD ?? "SamJohnson2026!";

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, CREATOR_EMAIL))
    .limit(1);

  if (existing) {
    await updateUserPassword(CREATOR_EMAIL, password);
    console.log(`Creator already exists — password updated (bcrypt): ${CREATOR_USERNAME} (${CREATOR_EMAIL})`);
    return existing;
  }

  const authId = randomUUID();
  const hashed = await hashPasswordForStorage(password);

  await db.insert(authUser).values({
    id: authId,
    name: "Sam Johnson",
    email: CREATOR_EMAIL,
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
      roleId: 2,
      username: CREATOR_USERNAME,
      email: CREATOR_EMAIL,
      passwordHash: hashed,
      status: "active",
      totalUploads: 0,
    })
    .returning();

  await db.insert(userProfiles).values({
    userId: user.id,
    firstName: "Sam",
    lastName: "Johnson",
    nickname: "Sam Johnson",
    biography:
      "Urban and cityscape photographer capturing skylines, highways, and night lights from above.",
    location: "Chicago, USA",
    interests: "cityscape, night photography, aerial views",
  });
  await db.insert(userPrivacy).values({ userId: user.id });
  await db.insert(userStats).values({ userId: user.id });
  await db.insert(userNotifs).values({ userId: user.id });

  console.log(`Seeded creator: ${CREATOR_USERNAME} (${CREATOR_EMAIL})`);
  console.log(`  Password: ${password} (bcrypt)`);
  return user;
}

async function ensureLandscapesCategory() {
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, "landscapes"))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(categories)
    .values({
      parentId: 1,
      slug: "landscapes",
      name: "Landscapes",
      pageTitle: "Landscapes | HD Wallpapers",
      pageDescription:
        "Stunning landscape and cityscape wallpapers in HD and 4K resolutions.",
      metaTitle: "Landscapes | HD Wallpapers",
      metaDescription:
        "Download beautiful landscape, nature, and cityscape wallpapers.",
      metaKeywords: "landscape,cityscape,nature,scenery,hd,wallpapers",
      totalWallpapers: 0,
    })
    .returning();

  console.log("Created Landscapes category");
  return created;
}

async function resolveLicenseId() {
  const [byId] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.id, 25))
    .limit(1);
  if (byId) return byId.id;

  const [first] = await db.select().from(licenses).limit(1);
  if (!first) {
    throw new Error("No licenses found. Run pnpm seed first.");
  }
  return first.id;
}

async function resolveTagIds(tagNames: string[]) {
  const tagIds: number[] = [];
  const uniqueNames: string[] = [];

  for (const name of tagNames) {
    const slug = slugifyTag(name);
    const [existing] = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existing) {
      tagIds.push(existing.id);
      uniqueNames.push(name);
      continue;
    }

    const [created] = await db
      .insert(tags)
      .values({ name, slug })
      .returning({ id: tags.id });

    tagIds.push(created.id);
    uniqueNames.push(name);
  }

  return { tagIds, uniqueNames };
}

export async function seedBeautifulCityWallpaper(userId: number) {
  const [existing] = await db
    .select()
    .from(wallpapers)
    .where(eq(wallpapers.slug, WALLPAPER_SLUG))
    .limit(1);

  if (existing) {
    console.log(`Wallpaper already exists: ${WALLPAPER_SLUG} (id ${existing.id})`);
    return existing;
  }

  const imagePath = join(
    process.cwd(),
    "scripts/seed/assets/beautiful-city-night-view.jpg"
  );
  const buffer = readFileSync(imagePath);
  const metadata = await sharp(buffer).metadata();
  const category = await ensureLandscapesCategory();
  const licenseId = await resolveLicenseId();
  const { tagIds, uniqueNames } = await resolveTagIds(TAG_NAMES);

  const [wallpaper] = await db
    .insert(wallpapers)
    .values({
      userId,
      categoryId: category.id,
      licenseId,
      slug: WALLPAPER_SLUG,
      title: WALLPAPER_TITLE,
      description:
        "Aerial night view of a sprawling modern city with glowing highways, teal-lit skyscrapers, and warm traffic light trails.",
      authorName: "Sam Johnson",
      tags: uniqueNames.join(", "),
      status: "draft",
      thumbUrl: "",
      width: metadata.width ?? 1024,
      height: metadata.height ?? 661,
      fileSize: buffer.length,
      metaTitle: `${WALLPAPER_TITLE} | HD Wallpaper`,
      metaDescription:
        "Download Beautiful City Night View — an aerial cityscape wallpaper with highway lights and skyline glow.",
      metaKeywords: uniqueNames.join(","),
    })
    .returning();

  await db.insert(wallpaperCategories).values({
    wallpaperId: wallpaper.id,
    categoryId: category.id,
  });

  if (tagIds.length > 0) {
    await db.insert(wallpaperTags).values(
      tagIds.map((tagId) => ({
        wallpaperId: wallpaper.id,
        tagId,
      }))
    );
  }

  const key = originalKey(wallpaper.uuid, "jpeg");
  await putObject(key, buffer, "image/jpeg");

  await db
    .update(wallpapers)
    .set({ originalKey: key, originalUrl: key })
    .where(eq(wallpapers.id, wallpaper.id));

  const { thumbUrl } = await processWallpaperVariants(
    wallpaper.id,
    wallpaper.uuid,
    buffer,
    undefined,
    true
  );

  await db
    .update(wallpapers)
    .set({
      status: "active",
      thumbUrl: thumbUrl || wallpaper.thumbUrl,
      dateToPublish: new Date(),
    })
    .where(eq(wallpapers.id, wallpaper.id));

  await db
    .update(users)
    .set({
      totalUploads: sql`${users.totalUploads} + 1`,
    })
    .where(eq(users.id, userId));

  await db
    .update(userStats)
    .set({
      uploadsActive: sql`${userStats.uploadsActive} + 1`,
    })
    .where(eq(userStats.userId, userId));

  await db
    .update(categories)
    .set({
      totalWallpapers: sql`${categories.totalWallpapers} + 1`,
    })
    .where(eq(categories.id, category.id));

  for (const tagId of tagIds) {
    await db
      .update(tags)
      .set({ totalWallpapers: sql`${tags.totalWallpapers} + 1` })
      .where(eq(tags.id, tagId));
  }

  console.log(`Seeded wallpaper: ${WALLPAPER_TITLE} (uuid ${wallpaper.uuid})`);
  console.log(`  Slug: /wallpapers/${WALLPAPER_SLUG}`);
  console.log(`  Category: Landscapes`);
  console.log(`  Tags: ${uniqueNames.join(", ")}`);
  return wallpaper;
}

export async function seedSamJohnsonWallpaper() {
  const user = await seedCreatorSamJohnson();
  await seedBeautifulCityWallpaper(user.id);
}
