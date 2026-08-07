import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Falls back to the standard local Postgres URL (matches docker-compose.yml)
 * instead of throwing at import time — a missing .env should surface as a
 * readable "cannot reach the database" message in the UI, not a crash that
 * takes down every page including the ones that don't need a database.
 */
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

if (!process.env.DATABASE_URL) {
  console.warn(
    "[db] DATABASE_URL is not set — falling back to postgresql://postgres:postgres@127.0.0.1:5432/app_db\n" +
      "[db] Create a .env file (see .env.example) to configure your own database."
  );
}

// Managed providers (Neon, Supabase, Render, Heroku) require SSL.
const needsSsl = /sslmode=require/.test(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

// Prevent an unhandled 'error' event from crashing the Node process when the
// database restarts or a pooled connection is dropped.
pool.on("error", (err) => {
  console.error("[db] idle client error:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
