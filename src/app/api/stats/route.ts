import { NextResponse } from "next/server";
import { db } from "@/db";
import { contacts, projects, quotes, services, testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    [{ projectCount }],
    [{ testimonialCount }],
    [{ contactCount }],
    [{ quoteCount }],
    [{ serviceCount }],
    [{ newContacts }],
    [{ pendingQuotes }],
    contactMonthly,
    quoteMonthly,
    recentContacts,
    recentQuotes,
  ] = await Promise.all([
    db.select({ projectCount: sql<number>`count(*)::int` }).from(projects),
    db.select({ testimonialCount: sql<number>`count(*)::int` }).from(testimonials),
    db.select({ contactCount: sql<number>`count(*)::int` }).from(contacts),
    db.select({ quoteCount: sql<number>`count(*)::int` }).from(quotes),
    db.select({ serviceCount: sql<number>`count(*)::int` }).from(services),
    db
      .select({ newContacts: sql<number>`count(*)::int` })
      .from(contacts)
      .where(eq(contacts.status, "new")),
    db
      .select({ pendingQuotes: sql<number>`count(*)::int` })
      .from(quotes)
      .where(eq(quotes.status, "pending")),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${contacts.createdAt}), 'Mon')`,
        monthNum: sql<string>`to_char(date_trunc('month', ${contacts.createdAt}), 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(contacts)
      .groupBy(sql`1, 2`)
      .orderBy(sql`2`),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${quotes.createdAt}), 'Mon')`,
        monthNum: sql<string>`to_char(date_trunc('month', ${quotes.createdAt}), 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(quotes)
      .groupBy(sql`1, 2`)
      .orderBy(sql`2`),
    db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(5),
    db.select().from(quotes).orderBy(desc(quotes.createdAt)).limit(5),
  ]);

  return NextResponse.json({
    counts: {
      projects: projectCount,
      testimonials: testimonialCount,
      contacts: contactCount,
      quotes: quoteCount,
      services: serviceCount,
      newContacts,
      pendingQuotes,
    },
    charts: { contactsByMonth: contactMonthly, quotesByMonth: quoteMonthly },
    recent: { contacts: recentContacts, quotes: recentQuotes },
  });
}
