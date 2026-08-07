/**
 * One-command database setup — works with Supabase, Neon or local Postgres.
 *
 *   node scripts/setup-db.mjs
 *   node scripts/setup-db.mjs "postgresql://...supabase.com:5432/postgres"
 *
 * Creates every table, then loads demo content and the admin user.
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL =
  process.argv[2] ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const ADMIN_NAME = process.env.ADMIN_NAME ?? "Abuzar Ahmed";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@abuzarsoftware.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

const masked = DATABASE_URL.replace(/:[^:@/]+@/, ":****@");
const isLocal = /@(localhost|127\.0\.0\.1)/.test(DATABASE_URL);
const isSupabase = /supabase/.test(DATABASE_URL);

console.log("\n  Abuzar Software Solutions — database setup");
console.log("  ------------------------------------------");
console.log(`  Target: ${masked}`);
if (isSupabase) console.log("  Provider: Supabase");

if (isSupabase && /:6543\//.test(DATABASE_URL)) {
  console.log(
    "\n  ! You are using the Transaction pooler (port 6543).\n" +
      "    Schema migrations need the Session pooler or Direct connection (port 5432).\n" +
      "    Use the 5432 URL for this script, then set the 6543 URL on Vercel.\n"
  );
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  connectionTimeoutMillis: 20_000,
});

async function main() {
  process.stdout.write("\n  1/3 Connecting… ");
  try {
    await pool.query("select 1");
    console.log("ok");
  } catch (err) {
    console.log("FAILED\n");
    console.error(`  ${err.message}\n`);
    if (isLocal) console.error("  Is Postgres running?  docker compose up -d\n");
    else console.error("  Check the password and that the host allows external connections.\n");
    process.exit(1);
  }

  process.stdout.write("  2/3 Creating tables… ");
  try {
    execSync("npx drizzle-kit push --force", {
      stdio: "pipe",
      env: { ...process.env, DATABASE_URL },
    });
    console.log("ok");
  } catch (err) {
    console.log("FAILED\n");
    console.error((err.stdout?.toString() || err.message).slice(0, 800));
    process.exit(1);
  }

  process.stdout.write("  3/3 Seeding demo data… ");
  const sqlText = await readFile(join(__dirname, "seed.sql"), "utf8");
  await pool.query(sqlText);

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `insert into users (name, email, password_hash, role)
     values ($1, $2, $3, 'admin')
     on conflict (email) do update
       set name = excluded.name, password_hash = excluded.password_hash`,
    [ADMIN_NAME, ADMIN_EMAIL, hash]
  );
  console.log("ok");

  const tables = ["users", "projects", "services", "testimonials", "contacts", "quotes", "settings"];
  const rows = [];
  for (const t of tables) {
    const r = await pool.query(`select count(*)::int as c from ${t}`);
    rows.push(`${t}: ${r.rows[0].c}`);
  }

  console.log("\n  Done!\n");
  console.log("  " + rows.join("\n  "));
  console.log("\n  Admin login");
  console.log(`    Email:    ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log("\n  Verify anytime:  curl <your-site>/api/health?full=1\n");
}

main()
  .catch((err) => {
    console.error("\n  Setup failed:", err.message, "\n");
    process.exitCode = 1;
  })
  .finally(() => pool.end());
