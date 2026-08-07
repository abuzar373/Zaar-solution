import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AUTH_COOKIE, signToken } from "@/lib/auth";
import { databaseError } from "@/lib/api-error";
import { provisionAdminIfConfigured } from "@/lib/admin-bootstrap";
import { ensureDatabaseSchema } from "@/db/bootstrap";

// naive in-memory rate limiter (per instance)
const attempts = new Map<string, { count: number; reset: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.reset > now && entry.count >= 10) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in a minute." },
      { status: 429 }
    );
  }
  if (!entry || entry.reset <= now) {
    attempts.set(ip, { count: 1, reset: now + 60_000 });
  } else {
    entry.count += 1;
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  let user;
  try {
    await ensureDatabaseSchema();
    [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    // First successful login creates the configured admin if the seed script
    // has not yet been run against the Supabase project.
    if (!user) user = await provisionAdminIfConfigured(email, password);
  } catch (error) {
    return databaseError("log in", error);
  }
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json(
      {
        error: "Invalid email or password. Use the configured ADMIN_EMAIL and ADMIN_PASSWORD, or run scripts/seed.sql in Supabase.",
      },
      { status: 401 }
    );
  }

  const token = signToken({ uid: user.id, email: user.email });
  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
