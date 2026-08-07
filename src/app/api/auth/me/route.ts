import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { databaseError } from "@/lib/api-error";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, session.uid)).limit(1);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ user: null, error: "Admin access required" }, { status: 401 });
    }
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return databaseError("verify your admin session", error);
  }
}
