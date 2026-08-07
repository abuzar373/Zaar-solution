import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { services } from "@/db/schema";
import { asc } from "drizzle-orm";
import { safeQuery } from "@/lib/safeQuery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website development, React, Node.js, WordPress, Ecommerce, SEO, UI/UX design, mobile apps and custom software development.",
};

export default async function ServicesPage() {
  const items = await safeQuery(
    () => db.select().from(services).orderBy(asc(services.sortOrder), asc(services.id)),
    [],
    "services:list"
  );

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">
            Our Services
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            Everything you need to <span className="text-indigo-500">grow online</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-slate-600 dark:text-slate-400">
            From strategy to launch — we design, build and scale digital products.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-20 text-center text-slate-500">
            <div className="text-5xl">🛠️</div>
            <p className="mt-4">Services are being updated. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <div
                key={s.id}
                className="group overflow-hidden glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-indigo-500/40 hover:-translate-y-1 transition-all"
              >
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={s.title} className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="grid h-40 w-full place-items-center bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 text-5xl">
                    {s.icon}
                  </div>
                )}
                <div className="p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-500/10 text-xl">{s.icon}</span>
                    <h2 className="font-semibold text-slate-900 dark:text-white">{s.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/quote"
            className="inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 font-semibold text-white shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
          >
            Start Your Project
          </Link>
        </div>
      </div>
    </div>
  );
}
