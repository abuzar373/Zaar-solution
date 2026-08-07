import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("[drizzle] DATABASE_URL is not set. Set it before running drizzle-kit push.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: databaseUrl || "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
  strict: true,
  verbose: true,
});
