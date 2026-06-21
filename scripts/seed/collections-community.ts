import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  challenges,
  collectionWallpapers,
  collections,
  users,
  wallpapers,
} from "@/lib/db/schema";

const SEED_COLLECTIONS = [
  { name: "Minimal Workspaces", slug: "minimal-workspaces", category: "Abstract", featured: true, saves: 1840, views: 12400, desc: "Clean, distraction-free desktop setups for deep work sessions." },
  { name: "Astronomy Archive", slug: "astronomy-archive", category: "Space", featured: true, saves: 3200, views: 28600, desc: "Galaxies, nebulae and cosmic phenomena photographed in 4K." },
  { name: "Scandinavian Seasons", slug: "scandinavian-seasons", category: "Nature", featured: true, saves: 2100, views: 16800, desc: "Nordic light captured across all four seasons in stunning clarity." },
  { name: "Neon Dreamscapes", slug: "neon-dreamscapes", category: "Abstract", featured: false, saves: 2780, views: 21500, desc: "Electric colour fields and psychedelic visions in vivid 4K." },
  { name: "JDM Culture", slug: "jdm-culture", category: "Cars", featured: false, saves: 1560, views: 9800, desc: "Japanese domestic market legends — from Skylines to Supras." },
  { name: "Brutalist Architecture", slug: "brutalist-architecture", category: "Architecture", featured: false, saves: 980, views: 7200, desc: "Stark concrete geometry from the golden age of Brutalism." },
  { name: "Ocean Depths", slug: "ocean-depths", category: "Nature", featured: false, saves: 2340, views: 18200, desc: "From sunlit coral reefs to the abyssal darkness of the deep sea." },
  { name: "Retro Synthwave", slug: "retro-synthwave", category: "Abstract", featured: false, saves: 4100, views: 34700, desc: "80s-inspired grid horizons, chrome text and sunset gradients." },
];

const SEED_CHALLENGES = [
  { slug: "golden-hour", title: "Golden Hour", accentColor: "#f5c518", desc: "Capture the warmth of dusk — sunsets, city lights, amber landscapes.", prize: "Creator badge + homepage feature", entries: 84, deadline: "2026-06-30", active: true },
  { slug: "cyberpunk-city", title: "Cyberpunk City", accentColor: "#ff2e63", desc: "Neon signs, rain-slicked streets, dystopian skylines after midnight.", prize: "Creator badge + 3 months Pro", entries: 127, deadline: "2026-07-15", active: true },
  { slug: "deep-ocean", title: "Deep Ocean", accentColor: "#22d3ee", desc: "Bioluminescent creatures, coral reefs and abyssal trenches in 4K.", prize: "Featured collection + Creator badge", entries: 45, deadline: "2026-07-31", active: false },
];

export async function seedCollectionsCommunity() {
  const [curator] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.status, "active"))
    .limit(1);

  if (!curator) return { collections: 0, challenges: 0 };

  const activeWallpapers = await db
    .select({ id: wallpapers.id })
    .from(wallpapers)
    .where(eq(wallpapers.status, "active"))
    .limit(200);

  let collectionsSeeded = 0;
  for (const item of SEED_COLLECTIONS) {
    const [existing] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(eq(collections.slug, item.slug))
      .limit(1);

    if (existing) continue;

    const wallpaperIds = activeWallpapers
      .slice(collectionsSeeded * 4, collectionsSeeded * 4 + Math.min(12, activeWallpapers.length))
      .map((w) => w.id);

    const [created] = await db
      .insert(collections)
      .values({
        slug: item.slug,
        name: item.name,
        description: item.desc,
        category: item.category,
        userId: curator.id,
        featured: item.featured,
        saveCount: item.saves,
        viewCount: item.views,
        wallpaperCount: wallpaperIds.length,
        status: "active",
      })
      .returning({ id: collections.id });

    if (wallpaperIds.length > 0) {
      await db.insert(collectionWallpapers).values(
        wallpaperIds.map((wallpaperId, i) => ({
          collectionId: created.id,
          wallpaperId,
          sortOrder: i,
        }))
      );
    }
    collectionsSeeded += 1;
  }

  let challengesSeeded = 0;
  for (const ch of SEED_CHALLENGES) {
    const [existing] = await db
      .select({ id: challenges.id })
      .from(challenges)
      .where(eq(challenges.slug, ch.slug))
      .limit(1);
    if (existing) continue;

    await db.insert(challenges).values({
      slug: ch.slug,
      title: ch.title,
      description: ch.desc,
      accentColor: ch.accentColor,
      prize: ch.prize,
      entryCount: ch.entries,
      deadline: new Date(ch.deadline),
      active: ch.active,
    });
    challengesSeeded += 1;
  }

  return { collections: collectionsSeeded, challenges: challengesSeeded };
}
