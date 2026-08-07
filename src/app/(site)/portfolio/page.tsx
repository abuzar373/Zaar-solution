"use client";

import { useCallback, useEffect, useState } from "react";

type Project = {
  id: number;
  title: string;
  category: string;
  description: string;
  technologies: string;
  githubUrl: string;
  liveUrl: string;
  image: string;
  featured: boolean;
};

const CATEGORIES = ["All", "Web App", "Website", "Mobile App", "Ecommerce", "Software"];

export default function PortfolioPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "9" });
    if (q.trim()) params.set("q", q.trim());
    if (category !== "All") params.set("category", category);
    try {
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setPages(data.pages ?? 1);
      setFailed(false);
    } catch {
      setItems([]);
      setPages(1);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, q, category]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">
            Portfolio
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            Work we are <span className="text-indigo-500">proud of</span>
          </h1>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(1); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category === c
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25"
                    : "glass border border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search projects…"
            className="w-full sm:w-64 rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {loading ? (
          <div className="mt-24 flex justify-center">
            <div className="spinner h-12 w-12" />
          </div>
        ) : failed ? (
          <div className="mt-24 text-center text-slate-500">
            <div className="text-5xl">⚠️</div>
            <p className="mt-4 font-medium text-slate-700 dark:text-slate-300">
              Couldn&apos;t load projects
            </p>
            <p className="text-sm">Please check your connection and try again.</p>
            <button
              onClick={load}
              className="mt-5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-24 text-center text-slate-500">
            <div className="text-5xl">🔍</div>
            <p className="mt-4 font-medium">No projects found</p>
            <p className="text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div
                key={p.id}
                className="group overflow-hidden glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-indigo-500/40 hover:-translate-y-1 transition-all"
              >
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.title} className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="grid h-48 w-full place-items-center bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 text-5xl">💼</div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">{p.category}</span>
                    {p.featured && <span className="text-sm text-amber-400">★</span>}
                  </div>
                  <h2 className="mt-3 font-semibold text-slate-900 dark:text-white">{p.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 line-clamp-3">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.technologies.split(",").filter(Boolean).slice(0, 4).map((t) => (
                      <span key={t} className="rounded-md bg-slate-500/10 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-400">{t.trim()}</span>
                    ))}
                  </div>
                  <div className="mt-5 flex gap-3 text-sm font-semibold">
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
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-10 w-10 rounded-lg text-sm font-semibold transition-colors ${
                  page === i + 1
                    ? "bg-indigo-500 text-white"
                    : "glass border border-slate-300/60 dark:border-white/10 hover:bg-slate-500/10"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
