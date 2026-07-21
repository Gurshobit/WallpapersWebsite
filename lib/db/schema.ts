import {
  pgSchema,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** PostgreSQL schema (replaces default `public`) */
export const DB_SCHEMA = "hdws_public";
export const hdwsPublic = pgSchema(DB_SCHEMA);

/** Matches v3 MySQL table prefix (hdwallsite_*) */
export const TABLE_PREFIX = "hdwallsite_";
const t = (name: string) => `${TABLE_PREFIX}${name}`;

// ── ENUMS ─────────────────────────────────────────────────────────────────────

export const wallpaperStatusEnum = hdwsPublic.enum("wallpaper_status", [
  "active",
  "pending",
  "rejected",
  "disabled",
  "delete",
  "draft",
]);

export const userStatusEnum = hdwsPublic.enum("user_status", [
  "active",
  "pending",
  "suspended",
  "closed",
  "email_changed",
  "delete",
]);

export const privacyEnum = hdwsPublic.enum("privacy_level", [
  "everyone",
  "only_me",
  "logged_members",
]);

export const commentStatusEnum = hdwsPublic.enum("comment_status", [
  "active",
  "pending",
  "rejected",
  "disabled",
  "spam",
]);

export const confirmTypeEnum = hdwsPublic.enum("confirm_type", [
  "registration",
  "changepwd",
  "passwordrecovery",
]);

export const adPlacementEnum = hdwsPublic.enum("ad_placement", [
  "header_728x90",
  "sidebar_300x250",
  "sidebar_160x800",
  "inline_grid",
]);

// ── BETTER AUTH TABLES ──────────────────────────────────────────────────────

export const authUser = hdwsPublic.table(t("auth_user"), {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const authSession = hdwsPublic.table(t("auth_session"), {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
});

export const authAccount = hdwsPublic.table(t("auth_account"), {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const authVerification = hdwsPublic.table(t("auth_verification"), {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── USER ROLES & PROFILES ───────────────────────────────────────────────────

export const userRoles = hdwsPublic.table(t("user_roles"), {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
});

export const users = hdwsPublic.table(t("users"), {
  id: serial("id").primaryKey(),
  authUserId: text("auth_user_id").references(() => authUser.id, {
    onDelete: "set null",
  }),
  roleId: integer("role_id")
    .notNull()
    .default(2)
    .references(() => userRoles.id),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  coverUrl: varchar("cover_url", { length: 500 }),
  totalUploads: integer("total_uploads").notNull().default(0),
  totalDownloads: integer("total_downloads").notNull().default(0),
  totalFavourites: integer("total_favourites").notNull().default(0),
  status: userStatusEnum("status").notNull().default("pending"),
  dateRegistered: timestamp("date_registered").defaultNow(),
  dateLastLogin: timestamp("date_last_login"),
});

export const userProfiles = hdwsPublic.table(t("user_profiles"), {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  nickname: varchar("nickname", { length: 255 }),
  biography: text("biography"),
  location: varchar("location", { length: 255 }),
  interests: varchar("interests", { length: 255 }),
  urlHomepage: varchar("url_homepage", { length: 255 }),
  urlTwitter: varchar("url_twitter", { length: 255 }),
  urlFacebook: varchar("url_facebook", { length: 255 }),
  urlLinkedin: varchar("url_linkedin", { length: 255 }),
});

export const userPrivacy = hdwsPublic.table(t("user_privacy"), {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  showAuthor: boolean("show_author").default(false),
  viewProfile: privacyEnum("view_profile").default("everyone"),
  viewContactInfo: privacyEnum("view_contact_info").default("everyone"),
  viewBio: privacyEnum("view_bio").default("everyone"),
  viewAvatar: privacyEnum("view_avatar").default("everyone"),
  viewDownloads: privacyEnum("view_downloads").default("everyone"),
  viewFavourites: privacyEnum("view_favourites").default("everyone"),
  viewWallpapers: privacyEnum("view_wallpapers").default("everyone"),
});

export const userStats = hdwsPublic.table(t("user_stats"), {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  uploadsActive: integer("uploads_active").default(0),
  uploadsPending: integer("uploads_pending").default(0),
  uploadsRejected: integer("uploads_rejected").default(0),
  uploadsDisabled: integer("uploads_disabled").default(0),
  totalLikes: integer("total_likes").default(0),
  totalDislikes: integer("total_dislikes").default(0),
  totalComments: integer("total_comments").default(0),
  downloadsUnique: integer("downloads_unique").default(0),
  followerCount: integer("follower_count").default(0),
});

export const userNotifs = hdwsPublic.table(t("user_notifs"), {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  emailOnComment: boolean("email_on_comment").default(true),
  emailOnFollow: boolean("email_on_follow").default(true),
  emailOnLike: boolean("email_on_like").default(false),
  emailNewsletter: boolean("email_newsletter").default(false),
});

// ── TAXONOMY ──────────────────────────────────────────────────────────────────

export const categories = hdwsPublic.table(t("categories"), {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id"),  // null = root-level; integer = sub-category parent id
  slug: varchar("slug", { length: 255 }).unique(),
  name: varchar("name", { length: 200 }).notNull(),
  pageTitle: varchar("page_title", { length: 200 }),
  pageDescription: text("page_description"),
  metaTitle: varchar("meta_title", { length: 200 }),
  metaDescription: varchar("meta_description", { length: 255 }),
  metaKeywords: varchar("meta_keywords", { length: 255 }),
  translations: jsonb("translations"),
  totalWallpapers: integer("total_wallpapers").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tags = hdwsPublic.table(t("tags"), {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  totalWallpapers: integer("total_wallpapers").notNull().default(0),
});

export const licenses = hdwsPublic.table(t("licenses"), {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 255 }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const resolutionTypes = hdwsPublic.table(t("resolution_types"), {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const resolutions = hdwsPublic.table(t("resolutions"), {
  id: serial("id").primaryKey(),
  typeId: integer("type_id")
    .notNull()
    .references(() => resolutionTypes.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 200 }).unique(),
  width: integer("width"),
  height: integer("height"),
  pageTitle: varchar("page_title", { length: 255 }),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 255 }),
  metaKeywords: varchar("meta_keywords", { length: 255 }),
  sortOrder: integer("sort_order").notNull().default(0),
  showInSidebar: boolean("show_in_sidebar").default(false),
});

// ── WALLPAPERS ────────────────────────────────────────────────────────────────

export const wallpapers = hdwsPublic.table(
  t("wallpapers"),
  {
    id: serial("id").primaryKey(),
    uuid: uuid("uuid").notNull().unique().defaultRandom(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    licenseId: integer("license_id")
      .notNull()
      .references(() => licenses.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 255 }).unique(),
    title: varchar("title", { length: 255 }).notNull(),
    authorName: varchar("author_name", { length: 150 }),
    authorWebsite: varchar("author_website", { length: 255 }),
    description: text("description"),
    tags: varchar("tags", { length: 500 }),
    thumbUrl: varchar("thumb_url", { length: 500 }).notNull().default(""),
    originalUrl: varchar("original_url", { length: 500 }),
    originalKey: varchar("original_key", { length: 500 }),
    dominantColors: jsonb("dominant_colors"),
    translations: jsonb("translations"),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: varchar("meta_description", { length: 255 }),
    metaKeywords: varchar("meta_keywords", { length: 255 }),
    width: integer("width"),
    height: integer("height"),
    fileSize: integer("file_size"),
    status: wallpaperStatusEnum("status").notNull().default("pending"),
    featured: boolean("featured").notNull().default(false),
    ratingValue: integer("rating_value").notNull().default(0),
    processingPending4k: boolean("processing_pending_4k").default(false),
    dateAdded: timestamp("date_added").defaultNow(),
    dateToPublish: timestamp("date_to_publish"),
  },
  (t) => ({
    statusIdx: index("wallpapers_status_idx").on(t.status),
    featuredIdx: index("wallpapers_featured_idx").on(t.featured),
    categoryIdx: index("wallpapers_category_idx").on(t.categoryId),
    userIdx: index("wallpapers_user_idx").on(t.userId),
    uuidIdx: index("wallpapers_uuid_idx").on(t.uuid),
    dominantColorsIdx: index("wallpapers_dominant_colors_idx").on(t.dominantColors),
  })
);

export const wallpaperImages = hdwsPublic.table(
  t("wallpaper_images"),
  {
    id: serial("id").primaryKey(),
    wallpaperId: integer("wallpaper_id").references(() => wallpapers.id, {
      onDelete: "cascade",
    }),
    resolutionId: integer("resolution_id").references(() => resolutions.id),
    typeId: integer("type_id").references(() => resolutionTypes.id),
    url: varchar("url", { length: 500 }).notNull(),
    format: varchar("format", { length: 10 }),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    fileSize: integer("file_size"),
    status: varchar("status", { length: 10 }).default("temp"),
  },
  (t) => ({
    uniqueVariant: uniqueIndex("wallpaper_images_unique").on(
      t.wallpaperId,
      t.resolutionId,
      t.format,
      t.width,
      t.height
    ),
  })
);

export const wallpaperCategories = hdwsPublic.table(
  t("wallpaper_categories"),
  {
    wallpaperId: integer("wallpaper_id")
      .notNull()
      .references(() => wallpapers.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: uniqueIndex("wc_pk").on(t.wallpaperId, t.categoryId),
  })
);

export const wallpaperTags = hdwsPublic.table(
  t("wallpaper_tags"),
  {
    wallpaperId: integer("wallpaper_id")
      .notNull()
      .references(() => wallpapers.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: uniqueIndex("wt_pk").on(t.wallpaperId, t.tagId),
  })
);

export const wallpaperComments = hdwsPublic.table(t("wallpaper_comments"), {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  wallpaperId: integer("wallpaper_id")
    .notNull()
    .references(() => wallpapers.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: commentStatusEnum("status").notNull().default("pending"),
  moderatorMessage: text("moderator_message"),
  isReported: boolean("is_reported").default(false),
  dateAdded: timestamp("date_added").defaultNow(),
});

export const wallpaperCommentsReported = hdwsPublic.table(t("wallpaper_comments_reported"), {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id")
    .notNull()
    .references(() => wallpaperComments.id, { onDelete: "cascade" }),
  reportedBy: integer("reported_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── ENGAGEMENT ────────────────────────────────────────────────────────────────

export const downloads = hdwsPublic.table(t("downloads"), {
  id: serial("id").primaryKey(),
  wallpaperId: integer("wallpaper_id")
    .notNull()
    .references(() => wallpapers.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  resolutionId: integer("resolution_id").references(() => resolutions.id),
  ipHash: varchar("ip_hash", { length: 64 }),
  format: varchar("format", { length: 10 }),
  dateDownloaded: timestamp("date_downloaded").defaultNow(),
});

export const favourites = hdwsPublic.table(
  t("favourites"),
  {
    id: serial("id").primaryKey(),
    wallpaperId: integer("wallpaper_id")
      .notNull()
      .references(() => wallpapers.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dateAdded: timestamp("date_added").defaultNow(),
  },
  (t) => ({
    uniqueFav: uniqueIndex("unique_favourite").on(t.wallpaperId, t.userId),
  })
);

export const ratings = hdwsPublic.table(
  t("ratings"),
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    wallpaperId: integer("wallpaper_id")
      .notNull()
      .references(() => wallpapers.id, { onDelete: "cascade" }),
    iLike: boolean("i_like").notNull(),
    dateVoted: timestamp("date_voted").defaultNow(),
  },
  (t) => ({
    uniqueRating: uniqueIndex("unique_rating").on(t.wallpaperId, t.userId),
  })
);

export const views = hdwsPublic.table(t("views"), {
  id: serial("id").primaryKey(),
  wallpaperId: integer("wallpaper_id")
    .notNull()
    .references(() => wallpapers.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  resolutionId: integer("resolution_id").references(() => resolutions.id),
  ipHash: varchar("ip_hash", { length: 64 }),
  dateViewed: timestamp("date_viewed").defaultNow(),
});

export const shortlists = hdwsPublic.table(
  t("shortlists"),
  {
    wallpaperId: integer("wallpaper_id")
      .notNull()
      .references(() => wallpapers.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dateAdded: timestamp("date_added").defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("shortlist_pk").on(t.wallpaperId, t.userId),
  })
);

export const follows = hdwsPublic.table(
  t("follows"),
  {
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: integer("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dateAdded: timestamp("date_added").defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("follows_pk").on(t.followerId, t.followingId),
  })
);

// ── DENORMALISED STATS ────────────────────────────────────────────────────────

export const topDownloads = hdwsPublic.table(t("top_downloads"), {
  wallpaperId: integer("wallpaper_id")
    .primaryKey()
    .references(() => wallpapers.id, { onDelete: "cascade" }),
  all: integer("all").notNull().default(0),
  today: integer("today").notNull().default(0),
  last7Days: integer("last_7_days").notNull().default(0),
  last30Days: integer("last_30_days").notNull().default(0),
  thisMonth: integer("this_month").notNull().default(0),
  lastMonth: integer("last_month").notNull().default(0),
});

export const topPopular = hdwsPublic.table(t("top_popular"), {
  wallpaperId: integer("wallpaper_id")
    .primaryKey()
    .references(() => wallpapers.id, { onDelete: "cascade" }),
  all: integer("all").notNull().default(0),
  today: integer("today").notNull().default(0),
  last7Days: integer("last_7_days").notNull().default(0),
  last30Days: integer("last_30_days").notNull().default(0),
});

export const topFavourites = hdwsPublic.table(t("top_favourites"), {
  wallpaperId: integer("wallpaper_id")
    .primaryKey()
    .references(() => wallpapers.id, { onDelete: "cascade" }),
  all: integer("all").notNull().default(0),
  today: integer("today").notNull().default(0),
  last7Days: integer("last_7_days").notNull().default(0),
  last30Days: integer("last_30_days").notNull().default(0),
});

export const topRatings = hdwsPublic.table(t("top_ratings"), {
  wallpaperId: integer("wallpaper_id")
    .primaryKey()
    .references(() => wallpapers.id, { onDelete: "cascade" }),
  all: integer("all").notNull().default(0),
  today: integer("today").notNull().default(0),
  last7Days: integer("last_7_days").notNull().default(0),
  last30Days: integer("last_30_days").notNull().default(0),
});

// ── I18N & ROUTES ───────────────────────────────────────────────────────────

export const languages = hdwsPublic.table(t("languages"), {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  nativeName: varchar("native_name", { length: 100 }),
  flagEmoji: varchar("flag_emoji", { length: 10 }),
  active: boolean("active").notNull().default(false),
  isDefault: boolean("is_default").notNull().default(false),
  translatedPct: integer("translated_pct").notNull().default(0),
});

export const routeSlugs = hdwsPublic.table(
  t("route_slugs"),
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 100 }).notNull(),
    locale: varchar("locale", { length: 10 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
  },
  (t) => ({
    uniqueKeyLocale: uniqueIndex("route_slugs_key_locale").on(t.key, t.locale),
  })
);

// ── PAGES ─────────────────────────────────────────────────────────────────────

export const pages = hdwsPublic.table(t("pages"), {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  content: text("content"),
  metaTitle: varchar("meta_title", { length: 500 }),
  metaDescription: text("meta_description"),
  status: varchar("status", { length: 20 }).notNull().default("published"),
  showInFooter: boolean("show_in_footer").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── COLLECTIONS & COMMUNITY ───────────────────────────────────────────────────

export const collections = hdwsPublic.table(
  t("collections"),
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    featured: boolean("featured").notNull().default(false),
    saveCount: integer("save_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    wallpaperCount: integer("wallpaper_count").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (tbl) => ({
    featuredIdx: index("collections_featured_idx").on(tbl.featured),
    categoryIdx: index("collections_category_idx").on(tbl.category),
    userIdx: index("collections_user_idx").on(tbl.userId),
  })
);

export const collectionWallpapers = hdwsPublic.table(
  t("collection_wallpapers"),
  {
    id: serial("id").primaryKey(),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    wallpaperId: integer("wallpaper_id")
      .notNull()
      .references(() => wallpapers.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    addedAt: timestamp("added_at").defaultNow(),
  },
  (tbl) => ({
    uniqueItem: uniqueIndex("collection_wallpapers_unique").on(
      tbl.collectionId,
      tbl.wallpaperId
    ),
  })
);

export const collectionSaves = hdwsPublic.table(
  t("collection_saves"),
  {
    id: serial("id").primaryKey(),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at").defaultNow(),
  },
  (tbl) => ({
    uniqueSave: uniqueIndex("collection_saves_unique").on(
      tbl.collectionId,
      tbl.userId
    ),
  })
);

export const challenges = hdwsPublic.table(t("challenges"), {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  accentColor: varchar("accent_color", { length: 20 }).default("#ff2e63"),
  prize: text("prize"),
  entryCount: integer("entry_count").notNull().default(0),
  deadline: timestamp("deadline"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeEntries = hdwsPublic.table(
  t("challenge_entries"),
  {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    wallpaperId: integer("wallpaper_id")
      .notNull()
      .references(() => wallpapers.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    enteredAt: timestamp("entered_at").defaultNow(),
  },
  (tbl) => ({
    uniqueEntry: uniqueIndex("challenge_entries_unique").on(
      tbl.challengeId,
      tbl.wallpaperId
    ),
  })
);

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export const moderationQueue = hdwsPublic.table(t("moderation_queue"), {
  id: serial("id").primaryKey(),
  wallpaperId: integer("wallpaper_id").references(() => wallpapers.id, {
    onDelete: "cascade",
  }),
  commentId: integer("comment_id").references(() => wallpaperComments.id, {
    onDelete: "cascade",
  }),
  moderatorId: integer("moderator_id").references(() => users.id, {
    onDelete: "set null",
  }),
  status: varchar("status", { length: 20 }).default("pending"),
  notes: text("notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adSlots = hdwsPublic.table(t("ad_slots"), {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  placement: varchar("placement", { length: 100 }),
  width: integer("width"),
  height: integer("height"),
  content: text("content"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  priority: integer("priority").default(0),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AdSlot = typeof adSlots.$inferSelect;

export const siteConfigs = hdwsPublic.table(t("site_configs"), {
  id: serial("id").primaryKey(),
  param: varchar("param", { length: 255 }).notNull().unique(),
  value: text("value"),
});

// Type exports
export type Wallpaper = typeof wallpapers.$inferSelect;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
