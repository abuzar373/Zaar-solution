import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { safeQuery } from "@/lib/safeQuery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recent Projects",
  description:
    "The latest software projects delivered by Abuzar Software Solutions — web apps, mobile apps, ecommerce stores and custom business software.",
};

export default async function RecentProjectsPage() {
  const items = await safeQuery(
    () => db.select().from(projects).orderBy(desc(projects.createdAt)).limit(12),
    [],
    "projects:recent"
  );

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">
            Recent Projects
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            Freshly <span className="text-indigo-500">shipped</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-slate-600 dark:text-slate-400">
            Our most recent work, updated automatically as we deliver new projects.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-24 text-center text-slate-500">
            <div className="text-5xl">🚀</div>
            <p className="mt-4 font-medium">No projects published yet</p>
            <p className="text-sm">Check back soon to see our latest work.</p>
          </div>
        ) : (
          <ol className="mt-16 relative border-l border-slate-200 dark:border-white/10 ml-3 sm:ml-6">
            {items.map((p, i) => (
              <li key={p.id} className="mb-10 ml-6 sm:ml-8">
                <span className="absolute -left-3 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white ring-4 ring-slate-50 dark:ring-[#070b16]">
                  {i + 1}
                </span>
                <div className="glass overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-indigo-500/40 transition-all">
                  <div className="grid md:grid-cols-3">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.title} className="h-48 w-full object-cover md:h-full" />
                    ) : (
                      <div className="grid h-48 w-full place-items-center bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 text-5xl md:h-full">
                        🚀
                      </div>
                    )}
                    <div className="p-6 md:col-span-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
                          {p.category}
                        </span>
                        {p.featured && <span className="text-xs font-semibold text-amber-400">★ Featured</span>}
                        <time className="ml-auto text-xs text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                        </time>
                      </div>
                      <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{p.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{p.description}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.technologies.split(",").filter(Boolean).map((t) => (
                          <span key={t} className="rounded-md bg-slate-500/10 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                      {(p.liveUrl || p.githubUrl) && (
                        <div className="mt-5 flex gap-4 text-sm font-semibold">
                          {p.liveUrl && (
                            <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-400">
                              Live Demo ↗
                            </a>
                          )}
                          {p.githubUrl && (
                            <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-400">
                              GitHub ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-8 text-center">
          <Link href="/portfolio" className="font-semibold text-indigo-500 hover:text-indigo-400">
            Browse the full portfolio →
          </Link>
        </div>
      </div>
    </div>
  );
}
