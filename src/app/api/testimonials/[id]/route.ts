import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { apiError } from "@/lib/apiError";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body || !body.clientName?.trim() || !body.review?.trim()) {
      return NextResponse.json({ error: "Client name and review are required" }, { status: 400 });
    }
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const [updated] = await db
      .update(testimonials)
      .set({
        clientName: String(body.clientName).trim(),
        company: String(body.company ?? "").trim(),
        review: String(body.review).trim(),
        photo: String(body.photo ?? "").trim(),
        rating,
      })
      .where(eq(testimonials.id, Number(id)))
      .returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (err) {
    return apiError(err, "PUT /api/testimonials/[id]");
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const [deleted] = await db
      .delete(testimonials)
      .where(eq(testimonials.id, Number(id)))
      .returning();
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError(err, "DELETE /api/testimonials/[id]");
  }
}
