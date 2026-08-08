import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { databaseError } from "@/lib/api-error";
import { ensureDatabaseSchema } from "@/db/bootstrap";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { apiError } from "@/lib/apiError";
import { ensureSchema } from "@/lib/bootstrap";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// simple per-instance rate limiting for public submissions
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
        ilike(contacts.fullName, `%${q}%`),
        ilike(contacts.email, `%${q}%`),
        ilike(contacts.company, `%${q}%`),
        ilike(contacts.message, `%${q}%`)
      );
      if (clause) conditions.push(clause);
    }
    if (status && status !== "all") conditions.push(eq(contacts.status, status));
    const where = conditions.length ? and(...conditions) : undefined;

    const [items, [{ count }]] = await Promise.all([
      db
        .select()
        .from(contacts)
        .where(where)
        .orderBy(desc(contacts.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ count: sql<number>`count(*)::int` }).from(contacts).where(where),
    ]);

    return NextResponse.json({ items, total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) {
    return apiError(err, "GET /api/contacts");
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseSchema();
  } catch (error) {
    return databaseError("connect to save your contact message", error);
  }

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

  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!fullName || fullName.length < 2)
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  if (!message || message.length < 10)
    return NextResponse.json(
      { error: "Message must be at least 10 characters" },
      { status: 400 }
    );

  try {
    // Create the tables if this is a brand new database.
    await ensureSchema();

    const [created] = await db
      .insert(contacts)
      .values({
        fullName,
        email,
        phone: String(body.phone ?? "").trim(),
        company: String(body.company ?? "").trim(),
        service: String(body.service ?? "").trim(),
        budget: String(body.budget ?? "").trim(),
        message,
      })
      .returning();

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    return apiError(err, "POST /api/contacts");
  }
}
