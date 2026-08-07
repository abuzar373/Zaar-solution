import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401, headers: NO_STORE });
    }
    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { headers: NO_STORE }
    );
  } catch (err) {
    console.error("auth/me failed:", err);
    return NextResponse.json(
      { user: null, error: "Server error while checking your session." },
      { status: 500, headers: NO_STORE }
    );
  }
}
