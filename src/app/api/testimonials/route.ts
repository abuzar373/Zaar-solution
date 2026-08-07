import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { and, desc, ilike, or, sql, type SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit")) || 20));

  const conditions: SQL[] = [];
  if (q) {
    const clause = or(
      ilike(testimonials.clientName, `%${q}%`),
      ilike(testimonials.company, `%${q}%`),
      ilike(testimonials.review, `%${q}%`)
    );
    if (clause) conditions.push(clause);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [items, [{ count }]] = await Promise.all([
    db
      .select()
      .from(testimonials)
      .where(where)
      .orderBy(desc(testimonials.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)::int` }).from(testimonials).where(where),
  ]);

  return NextResponse.json({ items, total: count, page, pages: Math.ceil(count / limit) });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || !body.clientName?.trim() || !body.review?.trim()) {
    return NextResponse.json({ error: "Client name and review are required" }, { status: 400 });
  }
  const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));

  const [created] = await db
    .insert(testimonials)
    .values({
      clientName: String(body.clientName).trim(),
      company: String(body.company ?? "").trim(),
      review: String(body.review).trim(),
      photo: String(body.photo ?? "").trim(),
      rating,
    })
    .returning();

  return NextResponse.json({ item: created }, { status: 201 });
}
