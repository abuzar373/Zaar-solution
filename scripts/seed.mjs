/**
 * Cross-platform database seeder — no `psql` required.
 *
 * Usage:
 *   npx drizzle-kit push     # create the tables first
 *   node scripts/seed.mjs    # then load demo data + admin user
 *
 * Safe to run multiple times (all inserts are idempotent).
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envOr = (k, d) => {
  const v = process.env[k];
  return typeof v === "string" && v.trim() ? v.trim() : d;
};

const DATABASE_URL = envOr("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/app_db");

const ADMIN_NAME = envOr("ADMIN_NAME", "Abuzar Ahmed");
const ADMIN_EMAIL = envOr("ADMIN_EMAIL", "admin@abuzarsoftware.com").toLowerCase();
const ADMIN_PASSWORD = envOr("ADMIN_PASSWORD", "admin123");

const needsSsl = /\bsslmode=require\b/.test(DATABASE_URL);

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

async function main() {
  console.log("→ Connecting to the database…");

  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error("\n✖ Could not connect to PostgreSQL.");
    console.error(`  URL: ${DATABASE_URL.replace(/:[^:@/]+@/, ":****@")}`);
    console.error(`  ${err.message}\n`);
    console.error("  Is Postgres running?  Try:  docker compose up -d\n");
    process.exit(1);
  }

  // Verify the schema has been pushed.
  const { rows } = await pool.query(
    "SELECT to_regclass('public.users') AS tbl"
  );
  if (!rows[0].tbl) {
    console.error("\n✖ Tables not found. Create them first:\n");
    console.error("    npx drizzle-kit push\n");
    process.exit(1);
  }

  // 1) Demo content (projects, services, testimonials, contacts, quotes, settings)
  console.log("→ Seeding demo content…");
  const sql = await readFile(join(__dirname, "seed.sql"), "utf8");
  await pool.query(sql);

  // 2) Admin user — hash generated at runtime so ADMIN_PASSWORD always works.
  console.log("→ Creating/updating the admin user…");
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`,
    [ADMIN_NAME, ADMIN_EMAIL, hash]
  );

  // 3) Summary
  const tables = ["users", "projects", "services", "testimonials", "contacts", "quotes", "settings"];
  const counts = await Promise.all(
    tables.map(async (t) => {
      const r = await pool.query(`SELECT count(*)::int AS c FROM ${t}`);
      return `${t}: ${r.rows[0].c}`;
    })
  );

  console.log("\n✓ Database seeded successfully!\n");
  console.log("  " + counts.join("\n  "));
  console.log("\n  Admin login");
  console.log(`    Email:    ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log("\n  Now run:  npm run dev   →  http://localhost:3000\n");
}

main()
  .catch((err) => {
    console.error("\n✖ Seeding failed:", err.message, "\n");
    process.exitCode = 1;
  })
  .finally(() => pool.end());
