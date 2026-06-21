import { migrateCollectionsCommunityTables } from "@/lib/db/migrate-collections-community";
import { seedCollectionsCommunity } from "./seed/collections-community";

async function main() {
  console.log("Migrating collections & community tables…");
  await migrateCollectionsCommunityTables();
  console.log("Seeding sample data…");
  const seeded = await seedCollectionsCommunity();
  console.log("Done:", seeded);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
