import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin, signToken, AUTH_COOKIE } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Update the signed-in admin's own name, email and/or password. */
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const currentPassword = String(body?.currentPassword ?? "");
  const newPassword = String(body?.newPassword ?? "");

  if (name.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const emailChanged = email !== admin.email;
  const wantsNewPassword = newPassword.length > 0;

  // Changing the email or the password requires confirming the current one.
  if (emailChanged || wantsNewPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Enter your current password to confirm these changes" },
        { status: 400 }
      );
    }
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Your current password is incorrect" }, { status: 401 });
    }
  }

  if (wantsNewPassword && newPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 }
    );
  }

  if (emailChanged) {
    const clash = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`${users.email} = ${email} and ${users.id} <> ${admin.id}`)
      .limit(1);
    if (clash.length) {
      return NextResponse.json({ error: "Another user already uses that email" }, { status: 409 });
    }
  }

  const [updated] = await db
    .update(users)
    .set({
      name,
      email,
      ...(wantsNewPassword ? { passwordHash: await bcrypt.hash(newPassword, 10) } : {}),
    })
    .where(eq(users.id, admin.id))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  // The session token embeds the email, so re-issue it after a change.
  const res = NextResponse.json({ item: updated });
  res.cookies.set(AUTH_COOKIE, signToken({ uid: updated.id, email: updated.email }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
