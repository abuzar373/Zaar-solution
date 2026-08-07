import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { databaseError } from "@/lib/api-error";

export async function GET() {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, unknown> = {};
    for (const row of rows) map[row.key] = row.value;
    return NextResponse.json({ settings: map });
  } catch (error) {
    return databaseError("load website settings", error);
  }
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.key !== "string" || !body.key.trim() || body.value === undefined) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  const key = body.key.trim();
  try {
    await db
      .insert(settings)
      .values({ key, value: body.value })
      .onConflictDoUpdate({ target: settings.key, set: { value: body.value } });

    return NextResponse.json({ ok: true, key });
  } catch (error) {
    return databaseError("save website settings", error);
  }
}
