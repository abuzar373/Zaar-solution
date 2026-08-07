import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AUTH_COOKIE, signToken } from "@/lib/auth";
import { ensureDefaultAdmin } from "@/lib/ensureAdmin";

export const dynamic = "force-dynamic";

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

  try {
    // First-run safety net: create the default admin if the table is empty.
    await ensureDefaultAdmin();

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[auth/login] failed:", message);

    // Tables have not been created yet.
    if (/relation .* does not exist/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Database tables are missing. Run `npx drizzle-kit push` and then `node scripts/seed.mjs`.",
        },
        { status: 503 }
      );
    }

    // Database server unreachable / wrong credentials in DATABASE_URL.
    if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|password authentication|database .* does not exist/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Cannot reach the database. Check DATABASE_URL in your .env file (try `docker compose up -d`).",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Server error during login. Check the server console for details." },
      { status: 500 }
    );
  }
}
