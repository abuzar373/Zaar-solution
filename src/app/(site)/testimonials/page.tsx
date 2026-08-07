import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Read what our clients say about working with Abuzar Software Solutions — real reviews from real businesses.",
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const [items, [{ avg }]] = await Promise.all([
    db.select().from(testimonials).orderBy(desc(testimonials.createdAt)),
    db.select({ avg: sql<number>`coalesce(round(avg(${testimonials.rating})::numeric, 1), 0)::float` }).from(testimonials),
  ]);

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">
            Testimonials
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            What our <span className="text-indigo-500">clients say</span>
          </h1>
          {items.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Stars rating={Math.round(avg)} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {avg} average from {items.length} review{items.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-24 text-center text-slate-500">
            <div className="text-5xl">💬</div>
            <p className="mt-4 font-medium">No testimonials yet</p>
            <p className="text-sm">Client reviews will appear here soon.</p>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <figure
                key={t.id}
                className="glass flex flex-col rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-7 hover:border-indigo-500/40 hover:-translate-y-1 transition-all"
              >
                <Stars rating={t.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  “{t.review}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-200/60 dark:border-white/10 pt-5">
                  {t.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photo} alt={t.clientName} className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-indigo-500/15 font-bold text-indigo-500">
                      {t.clientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.clientName}</div>
                    <div className="text-xs text-slate-500">{t.company}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/quote"
            className="inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 font-semibold text-white shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
          >
            Become our next success story
          </Link>
        </div>
      </div>
    </div>
  );
}
