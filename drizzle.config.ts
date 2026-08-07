import "dotenv/config";
import type { Config } from "drizzle-kit";

/**
 * Reads DATABASE_URL from your .env file so the project works on any machine.
 * Falls back to the standard local Postgres URL used by docker-compose.yml.
 */
const url =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
} satisfies Config;
