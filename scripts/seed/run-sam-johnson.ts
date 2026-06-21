import "dotenv/config";
import { seedSamJohnsonWallpaper } from "./sam-johnson-wallpaper";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required. Copy .env.example to .env.local");
    process.exit(1);
  }

  if (!process.env.R2_ACCOUNT_ID) {
    console.error("R2 credentials are required in .env.local");
    process.exit(1);
  }

  console.log("Seeding Sam Johnson creator + wallpaper...");
  await seedSamJohnsonWallpaper();
  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
