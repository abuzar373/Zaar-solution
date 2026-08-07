import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { apiError } from "@/lib/apiError";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const submissions = new Map<string, { count: number; reset: number }>();

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sp = req.nextUrl.searchParams;
    const q = sp.get("q")?.trim();
    const status = sp.get("status")?.trim();
    const page = Math.max(1, Number(sp.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(sp.get("limit")) || 10));

    const conditions: SQL[] = [];
    if (q) {
      const clause = or(
        ilike(quotes.name, `%${q}%`),
        ilike(quotes.email, `%${q}%`),
        ilike(quotes.business, `%${q}%`),
        ilike(quotes.projectType, `%${q}%`)
      );
      if (clause) conditions.push(clause);
    }
    if (status && status !== "all") conditions.push(eq(quotes.status, status));
    const where = conditions.length ? and(...conditions) : undefined;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(quotes)
        .where(where)
        .orderBy(desc(quotes.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ count: sql<number>`count(*)::int` }).from(quotes).where(where),
    ]);

    return NextResponse.json({ items, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) {
    return apiError(err, "GET /api/quotes");
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const now = Date.now();
  const entry = submissions.get(ip);
  if (entry && entry.reset > now && entry.count >= 5) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }
  if (!entry || entry.reset <= now) submissions.set(ip, { count: 1, reset: now + 60_000 });
  else entry.count += 1;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (!name || name.length < 2)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  if (!description || description.length < 10)
    return NextResponse.json(
      { error: "Project description must be at least 10 characters" },
      { status: 400 }
    );

  try {
    const [created] = await db
      .insert(quotes)
      .values({
        name,
        email,
        phone: String(body.phone ?? "").trim(),
        business: String(body.business ?? "").trim(),
        projectType: String(body.projectType ?? "").trim(),
        budget: String(body.budget ?? "").trim(),
        deadline: String(body.deadline ?? "").trim(),
        description,
      })
      .returning();

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/quotes");
  }
}
