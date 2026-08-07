import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  const storageConfigured = Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({
      ok: true,
      database: "connected",
      databaseConfigured,
      supabaseStorageConfigured: storageConfigured,
    });
  } catch (error) {
    console.error("[health] database check failed", error);
    return NextResponse.json(
      {
        ok: false,
        database: "unavailable",
        databaseConfigured,
        supabaseStorageConfigured: storageConfigured,
        message: "Set DATABASE_URL to your Supabase PostgreSQL connection string.",
      },
      { status: 503 }
    );
  }
}
