import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq, ne, sql } from "drizzle-orm";
import { apiError } from "@/lib/apiError";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const userId = Number(id);
    const body = await req.json().catch(() => null);

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const role = body?.role === "editor" ? "editor" : "admin";

    if (name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (password && password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Email must stay unique across other users.
    const clash = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`${users.email} = ${email} and ${users.id} <> ${userId}`)
      .limit(1);
    if (clash.length) {
      return NextResponse.json({ error: "Another user already uses that email" }, { status: 409 });
    }

    // Never allow demoting the last admin.
    if (role !== "admin" && userId === admin.id) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set({
        name,
        email,
        role,
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt });

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (err) {
    return apiError(err, "PUT /api/users/[id]");
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const userId = Number(id);

    if (userId === admin.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // Never leave the site without an admin.
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(ne(users.id, userId));
    if (count < 1) {
      return NextResponse.json({ error: "Cannot delete the last remaining user" }, { status: 400 });
    }

    const [deleted] = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "DELETE /api/users/[id]");
  }
}
