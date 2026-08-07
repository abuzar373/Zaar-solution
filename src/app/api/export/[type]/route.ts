import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts, quotes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ type: string }> };

/** Escape a value for CSV (RFC 4180). */
function cell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join("\r\n");
}

export async function GET(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type } = await params;
  let csv: string;
  let filename: string;

  if (type === "contacts") {
    const rows = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
    csv = toCsv(
      ["ID", "Full Name", "Email", "Phone", "Company", "Service", "Budget", "Message", "Status", "Received"],
      rows.map((r) => [
        r.id, r.fullName, r.email, r.phone, r.company, r.service, r.budget, r.message, r.status,
        r.createdAt.toISOString(),
      ])
    );
    filename = "contact-requests";
  } else if (type === "quotes") {
    const rows = await db.select().from(quotes).orderBy(desc(quotes.createdAt));
    csv = toCsv(
      ["ID", "Name", "Email", "Phone", "Business", "Project Type", "Budget", "Deadline", "Description", "Status", "Received"],
      rows.map((r) => [
        r.id, r.name, r.email, r.phone, r.business, r.projectType, r.budget, r.deadline,
        r.description, r.status, r.createdAt.toISOString(),
      ])
    );
    filename = "quote-requests";
  } else {
    return NextResponse.json({ error: "Unknown export type" }, { status: 404 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
