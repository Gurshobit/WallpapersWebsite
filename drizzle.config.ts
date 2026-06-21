import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { DB_SCHEMA } from "./lib/db/schema";

// drizzle-kit does not auto-load Next.js env files
config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (see .env.example)."
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: [DB_SCHEMA],
  dbCredentials: {
    url: databaseUrl,
  },
});
