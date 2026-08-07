"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  EmptyState,
  ImageUpload,
  Modal,
  Pagination,
  Spinner,
  btnGhost,
  btnPrimary,
  cardCls,
  inputCls,
  useToast,
} from "@/components/admin/ui";

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
  createdAt: string;
};

const CATEGORIES = ["Web App", "Website", "Mobile App", "Ecommerce", "Software"];
const empty = { title: "", category: "Web App", description: "", technologies: "", githubUrl: "", liveUrl: "", image: "", featured: false };

export default function AdminProjects() {
  const toast = useToast();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "8", sort });
    if (q.trim()) params.set("q", q.trim());
    try {
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setPages(data.pages ?? 1);
    } catch {
      setItems([]);
      toast("Could not load projects", "error");
    } finally {
      setLoading(false);
    }
  }, [page, q, sort, toast]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModal(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({ ...p });
    setModal(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/projects/${editing.id}` : "/api/projects", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast(editing ? "Project updated" : "Project created");
      setModal(false);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Project) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    const prev = items;
    setItems(items.filter((x) => x.id !== p.id)); // optimistic
    const res = await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
    if (!res.ok) {
      setItems(prev);
      toast("Delete failed", "error");
    } else {
      toast("Project deleted");
    }
  };

  const toggleFeatured = async (p: Project) => {
    const prev = items;
    setItems(items.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x))); // optimistic
    const res = await fetch(`/api/projects/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, featured: !p.featured }),
    });
    if (!res.ok) {
      setItems(prev);
      toast("Update failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio & Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the projects shown on your website.</p>
        </div>
        <button onClick={openCreate} className={btnPrimary}>+ Add Project</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search projects…"
          className={`${inputCls} max-w-xs`}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")} className={`${inputCls} w-40`}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className={cardCls}>
          <EmptyState icon="💼" title="No projects found" subtitle="Add your first project or adjust the search." />
        </div>
      ) : (
        <div className={`${cardCls} overflow-x-auto`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Technologies</th>
                <th className="px-5 py-4">Featured</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-slate-200/40 dark:border-white/5 hover:bg-slate-500/5">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="h-11 w-16 rounded-lg object-cover" />
                      ) : (
                        <div className="grid h-11 w-16 place-items-center rounded-lg bg-indigo-500/10">💼</div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{p.title}</div>
                        <div className="max-w-[280px] truncate text-xs text-slate-500">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-500">{p.category}</span>
                  </td>
                  <td className="max-w-[180px] truncate px-5 py-4 text-xs text-slate-500">{p.technologies}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleFeatured(p)} className={`text-lg ${p.featured ? "text-amber-400" : "text-slate-400/50 hover:text-amber-400"}`} title="Toggle featured">
                      ★
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-500 hover:bg-indigo-500/10">Edit</button>
                    <button onClick={() => remove(p)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onPage={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Project" : "Add Project"} wide>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Description *</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Technologies (comma separated)</label>
            <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js, PostgreSQL" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">GitHub Link</label>
            <input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/…" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Live Demo</label>
            <input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://…" className={inputCls} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input id="featured" type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-indigo-500" />
            <label htmlFor="featured" className="text-sm font-medium">Featured project</label>
          </div>
          <div className="sm:col-span-2">
            <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Project Image" />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving…" : editing ? "Update Project" : "Create Project"}</button>
            <button type="button" onClick={() => setModal(false)} className={btnGhost}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
