import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [item] = await db.select().from(projects).where(eq(projects.id, Number(id))).limit(1);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || !body.title?.trim() || !body.category?.trim() || !body.description?.trim()) {
    return NextResponse.json(
      { error: "Title, category and description are required" },
      { status: 400 }
    );
  }
  const [updated] = await db
    .update(projects)
    .set({
      title: String(body.title).trim(),
      category: String(body.category).trim(),
      description: String(body.description).trim(),
      technologies: String(body.technologies ?? "").trim(),
      githubUrl: String(body.githubUrl ?? "").trim(),
      liveUrl: String(body.liveUrl ?? "").trim(),
      image: String(body.image ?? "").trim(),
      featured: Boolean(body.featured),
    })
    .where(eq(projects.id, Number(id)))
    .returning();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [deleted] = await db.delete(projects).where(eq(projects.id, Number(id))).returning();
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
