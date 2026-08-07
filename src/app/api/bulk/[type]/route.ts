import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts, quotes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ type: string }> };

const VALID_STATUS: Record<string, string[]> = {
  contacts: ["new", "read", "replied"],
  quotes: ["pending", "reviewed", "accepted", "declined"],
};

/** Bulk delete or bulk status-update for contact / quote submissions. */
export async function POST(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type } = await params;
  if (type !== "contacts" && type !== "quotes") {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? "");
  const ids = Array.isArray(body?.ids)
    ? body.ids.map((n: unknown) => Number(n)).filter((n: number) => Number.isInteger(n) && n > 0)
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "No items selected" }, { status: 400 });
  }
  if (ids.length > 500) {
    return NextResponse.json({ error: "Too many items selected" }, { status: 400 });
  }

  const table = type === "contacts" ? contacts : quotes;

  if (action === "delete") {
    const deleted = await db.delete(table).where(inArray(table.id, ids)).returning({ id: table.id });
    return NextResponse.json({ ok: true, affected: deleted.length });
  }

  if (action === "status") {
    const status = String(body?.status ?? "");
    if (!VALID_STATUS[type].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const updated = await db
      .update(table)
      .set({ status })
      .where(inArray(table.id, ids))
      .returning({ id: table.id });
    return NextResponse.json({ ok: true, affected: updated.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
