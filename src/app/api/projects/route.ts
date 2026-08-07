import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { databaseError } from "@/lib/api-error";
import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const category = sp.get("category")?.trim();
  const featured = sp.get("featured");
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit")) || 12));
  const sort = sp.get("sort") === "oldest" ? asc(projects.createdAt) : desc(projects.createdAt);

  const conditions: SQL[] = [];
  if (q) {
    const clause = or(
      ilike(projects.title, `%${q}%`),
      ilike(projects.description, `%${q}%`),
      ilike(projects.technologies, `%${q}%`)
    );
    if (clause) conditions.push(clause);
  }
  if (category && category !== "All") conditions.push(eq(projects.category, category));
  if (featured === "true") conditions.push(eq(projects.featured, true));

  const where = conditions.length ? and(...conditions) : undefined;

  try {
    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(projects)
        .where(where)
        .orderBy(sort)
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ count: sql<number>`count(*)::int` }).from(projects).where(where),
    ]);

    return NextResponse.json({ items, total: count, page, pages: Math.ceil(count / limit) });
  } catch (error) {
    return databaseError("load projects", error);
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !body.title?.trim() || !body.category?.trim() || !body.description?.trim()) {
    return NextResponse.json(
      { error: "Title, category and description are required" },
      { status: 400 }
    );
  }

  try {
    const [created] = await db
      .insert(projects)
      .values({
        title: String(body.title).trim(),
        category: String(body.category).trim(),
        description: String(body.description).trim(),
        technologies: String(body.technologies ?? "").trim(),
        githubUrl: String(body.githubUrl ?? "").trim(),
        liveUrl: String(body.liveUrl ?? "").trim(),
        image: String(body.image ?? "").trim(),
        featured: Boolean(body.featured),
      })
      .returning();

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    return databaseError("create project", error);
  }
}
