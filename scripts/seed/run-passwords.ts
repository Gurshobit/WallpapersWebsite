import "dotenv/config";
import { seedPasswords } from "./passwords";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required. Copy .env.example to .env.local");
    process.exit(1);
  }

  await seedPasswords();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
