import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { bootstrapDatabase } from "@/lib/bootstrap";
import { apiError } from "@/lib/apiError";
import { ADMIN_DEFAULTS } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * One-click database setup.
 *
 * Visit /api/setup in a browser (or POST to it) to create every table and the
 * default admin account against whatever DATABASE_URL is configured. Useful
 * right after deploying to Vercel with a fresh Supabase project.
 *
 * Safe to call repeatedly — it never overwrites existing data.
 */
async function run() {
  try {
    await bootstrapDatabase();

    const counts = await db.execute<Record<string, number>>(sql`
      select
        (select count(*) from users)::int        as users,
        (select count(*) from projects)::int     as projects,
        (select count(*) from services)::int     as services,
        (select count(*) from testimonials)::int as testimonials,
        (select count(*) from contacts)::int     as contacts,
        (select count(*) from quotes)::int       as quotes,
        (select count(*) from settings)::int     as settings
    `);

    return NextResponse.json({
      ok: true,
      message: "Database is ready. You can now sign in at /login.",
      counts: counts.rows[0] ?? {},
      adminEmail: ADMIN_DEFAULTS.email,
      note: "Demo password is admin123 unless ADMIN_PASSWORD is set. Change it under Admin → My Profile.",
    });
  } catch (err) {
    return apiError(err, "GET /api/setup");
  }
}

export async function GET() {
  return run();
}

export async function POST() {
  return run();
}
