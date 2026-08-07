import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDatabaseSchema } from "@/db/bootstrap";

export const dynamic = "force-dynamic";

/**
 * Health / diagnostics endpoint.
 *
 * `GET /api/health`          → { ok: true }
 * `GET /api/health?full=1`   → connection + schema + row-count details,
 *                              useful for verifying a Supabase deployment.
 */
export async function GET(req: Request) {
  const full = new URL(req.url).searchParams.get("full");

  try {
    await db.execute(sql`select 1`);

    if (!full) return Response.json({ ok: true });

    const url = process.env.DATABASE_URL ?? "";
    const host = url.replace(/^.*@/, "").replace(/\/.*$/, "") || "not set";

    const tables = await db.execute<{ table_name: string }>(
      sql`select table_name from information_schema.tables
          where table_schema = 'public' order by table_name`
    );
    const names = tables.rows.map((r) => r.table_name);

    const expected = [
      "users", "projects", "services",
      "testimonials", "contacts", "quotes", "settings",
    ];
    const missing = expected.filter((t) => !names.includes(t));

    let counts: Record<string, number> = {};
    if (missing.length === 0) {
      const r = await db.execute<Record<string, number>>(sql`
        select
          (select count(*) from users)::int        as users,
          (select count(*) from projects)::int     as projects,
          (select count(*) from services)::int     as services,
          (select count(*) from testimonials)::int as testimonials,
          (select count(*) from contacts)::int     as contacts,
          (select count(*) from quotes)::int       as quotes,
          (select count(*) from settings)::int     as settings
      `);
      counts = r.rows[0] ?? {};
    }

    return Response.json({
      ok: missing.length === 0,
      database: {
        host,
        connected: true,
        ssl: !/@(localhost|127\.0\.0\.1)/.test(url),
        provider: /supabase/.test(url)
          ? "Supabase"
          : /neon\.tech/.test(url)
            ? "Neon"
            : /localhost|127\.0\.0\.1/.test(url)
              ? "Local"
              : "Other",
      },
      schema: {
        ready: missing.length === 0,
        missingTables: missing,
        hint: missing.length
          ? "Run: npx drizzle-kit push  (then: node scripts/seed.mjs)"
          : undefined,
      },
      counts,
      authSecretSet: Boolean(process.env.AUTH_SECRET),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      {
        ok: false,
        error: message,
        hint: /does not exist/i.test(message)
          ? "Tables missing — run `npx drizzle-kit push`."
          : "Check that DATABASE_URL is set correctly and the database is reachable.",
      },
      { status: 503 }
    );
  }
}
