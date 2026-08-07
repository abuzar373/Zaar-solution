import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || !body.title?.trim() || !body.description?.trim()) {
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
  }
  const [updated] = await db
    .update(services)
    .set({
      title: String(body.title).trim(),
      icon: String(body.icon ?? "💻").trim() || "💻",
      description: String(body.description).trim(),
      image: String(body.image ?? "").trim(),
      sortOrder: Number(body.sortOrder) || 0,
    })
    .where(eq(services.id, Number(id)))
    .returning();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [deleted] = await db.delete(services).where(eq(services.id, Number(id))).returning();
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
