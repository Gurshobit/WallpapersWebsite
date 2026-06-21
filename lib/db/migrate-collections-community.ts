import { sql } from "drizzle-orm";
import { db } from "@/lib/db/index";

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS hdws_public.hdwallsite_collections (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    user_id INTEGER NOT NULL REFERENCES hdws_public.hdwallsite_users(id) ON DELETE CASCADE,
    featured BOOLEAN NOT NULL DEFAULT false,
    save_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    wallpaper_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS hdws_public.hdwallsite_collection_wallpapers (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES hdws_public.hdwallsite_collections(id) ON DELETE CASCADE,
    wallpaper_id INTEGER NOT NULL REFERENCES hdws_public.hdwallsite_wallpapers(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(collection_id, wallpaper_id)
  )`,
  `CREATE TABLE IF NOT EXISTS hdws_public.hdwallsite_collection_saves (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES hdws_public.hdwallsite_collections(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES hdws_public.hdwallsite_users(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(collection_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS hdws_public.hdwallsite_challenges (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    accent_color VARCHAR(20) DEFAULT '#ff2e63',
    prize TEXT,
    entry_count INTEGER NOT NULL DEFAULT 0,
    deadline TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS hdws_public.hdwallsite_challenge_entries (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES hdws_public.hdwallsite_challenges(id) ON DELETE CASCADE,
    wallpaper_id INTEGER NOT NULL REFERENCES hdws_public.hdwallsite_wallpapers(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES hdws_public.hdwallsite_users(id) ON DELETE CASCADE,
    entered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(challenge_id, wallpaper_id)
  )`,
];

export async function migrateCollectionsCommunityTables() {
  for (const statement of STATEMENTS) {
    await db.execute(sql.raw(statement));
  }
}
