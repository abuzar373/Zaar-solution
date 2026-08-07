import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * PostgreSQL connection — works with local Postgres, Supabase, Neon,
 * Render, Railway and any other managed provider.
 *
 * Falls back to the local docker-compose URL instead of throwing at import
 * time, so a missing .env surfaces as a readable error in the UI rather than
 * crashing the whole app (including pages that need no database at all).
 */
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

if (!process.env.DATABASE_URL) {
  console.warn(
    "[db] DATABASE_URL is not set — falling back to postgresql://postgres:postgres@127.0.0.1:5432/app_db\n" +
      "[db] Set DATABASE_URL in your .env file or hosting provider's environment variables."
  );
}

const isLocal = /@(localhost|127\.0\.0\.1|host\.docker\.internal|postgres)[:/]/.test(databaseUrl);

/**
 * Managed Postgres always requires TLS. Supabase and Neon connection strings
 * are frequently pasted without `?sslmode=require`, which produces a confusing
 * "SSL connection required" error — so enable SSL for anything non-local.
 */
const useSsl = !isLocal;

/**
 * Supabase's transaction pooler (Supavisor, port 6543) and PgBouncer do not
 * support session-level prepared statements. node-postgres uses the unnamed
 * extended-query protocol, which is compatible, but connections must be kept
 * short-lived and few.
 */
const isTransactionPooler =
  /:6543\//.test(databaseUrl) || /pgbouncer=true/.test(databaseUrl);

/**
 * Serverless platforms (Vercel) run many isolated instances, each with its own
 * pool. A large pool per instance quickly exhausts the database's connection
 * limit, so keep it small in production.
 */
const maxConnections = isLocal ? 10 : isTransactionPooler ? 1 : 3;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: maxConnections,
    // Managed providers terminate idle connections; recycle them proactively.
    idleTimeoutMillis: 20_000,
    // Fail fast with a clear error instead of hanging the request.
    connectionTimeoutMillis: 12_000,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

// Without this, a dropped connection emits an unhandled 'error' event that
// crashes the Node process.
pool.on("error", (err) => {
  console.error("[db] idle client error:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
