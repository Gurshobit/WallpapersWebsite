import { db } from "../../lib/db";
import { adSlots } from "../../lib/db/schema";

const SLOTS = [
  {
    name: "Header Leaderboard",
    slug: "header_728x90",
    placement: "header_728x90" as const,
    width: 728,
    height: 90,
    content: "<!-- Ad slot: 728x90 leaderboard -->",
    active: true,
  },
  {
    name: "Sidebar Medium Rectangle",
    slug: "sidebar_300x250",
    placement: "sidebar_300x250" as const,
    width: 300,
    height: 250,
    content: "<!-- Ad slot: 300x250 sidebar -->",
    active: true,
  },
  {
    name: "Sidebar Skyscraper",
    slug: "sidebar_160x800",
    placement: "sidebar_160x800" as const,
    width: 160,
    height: 800,
    content: "<!-- Ad slot: 160x800 sidebar -->",
    active: true,
  },
];

export async function seedAds() {
  for (const slot of SLOTS) {
    await db.insert(adSlots).values(slot).onConflictDoNothing();
  }
  console.log(`Seeded ${SLOTS.length} ad slots`);
}
