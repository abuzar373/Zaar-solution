import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { asc } from "drizzle-orm";

export async function GET() {
  const items = await db.select().from(services).orderBy(asc(services.sortOrder), asc(services.id));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !body.title?.trim() || !body.description?.trim()) {
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
  }

  const [created] = await db
    .insert(services)
    .values({
      title: String(body.title).trim(),
      icon: String(body.icon ?? "💻").trim() || "💻",
      description: String(body.description).trim(),
      image: String(body.image ?? "").trim(),
      sortOrder: Number(body.sortOrder) || 0,
    })
    .returning();

  return NextResponse.json({ item: created }, { status: 201 });
}
