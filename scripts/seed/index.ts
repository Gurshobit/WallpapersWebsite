import "dotenv/config";
import { seedRoles, seedAdmin } from "./admin";
import { seedCategories } from "./categories";
import { seedResolutions } from "./resolutions";
import { seedLicenses } from "./licenses";
import { seedLanguages } from "./languages";
import { seedAds } from "./ads";
import { seedPages } from "./pages";
import { db } from "../../lib/db";
import { categories } from "../../lib/db/schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required. Copy .env.example to .env.local");
    process.exit(1);
  }

  console.log("Starting seed...");

  await seedRoles();
  await seedCategories();
  await seedResolutions();
  await seedLicenses();
  await seedLanguages();
  await seedAds();
  await seedPages();
  await seedAdmin();

  // Ensure default category exists for uploads
  const cats = await db.select().from(categories).limit(1);
  if (cats.length === 0) {
    await db.insert(categories).values({
      id: 2,
      parentId: 1,
      slug: "3d-abstract",
      name: "3D & Abstract",
      totalWallpapers: 0,
    });
  }

  console.log("Seed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
