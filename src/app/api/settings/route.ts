import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/apiError";

export async function GET() {
  try {
    await ensureDatabaseSchema();
  } catch (error) {
    return databaseError("connect to load website settings", error);
  }

  try {
    const rows = await db.select().from(settings);
    const map: Record<string, unknown> = {};
    for (const row of rows) map[row.key] = row.value;
    return NextResponse.json({ settings: map });
  } catch (err) {
    return apiError(err, "GET /api/settings");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body || typeof body.key !== "string" || !body.key.trim() || body.value === undefined) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 });
    }

    const key = body.key.trim();
    await db
      .insert(settings)
      .values({ key, value: body.value })
      .onConflictDoUpdate({ target: settings.key, set: { value: body.value } });

    return NextResponse.json({ ok: true, key });
  } catch (err) {
    return apiError(err, "PUT /api/settings");
  }
}
