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

type Testimonial = {
  id: number;
  clientName: string;
  company: string;
  review: string;
  photo: string;
  rating: number;
};

const empty = { clientName: "", company: "", review: "", photo: "", rating: 5 };

export default function AdminTestimonials() {
  const toast = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "9" });
    if (q.trim()) params.set("q", q.trim());
    try {
      const res = await fetch(`/api/testimonials?${params}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setPages(data.pages ?? 1);
    } catch {
      setItems([]);
      toast("Could not load testimonials", "error");
    } finally {
      setLoading(false);
    }
  }, [page, q, toast]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/testimonials/${editing.id}` : "/api/testimonials", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast(editing ? "Testimonial updated" : "Testimonial created");
      setModal(false);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t: Testimonial) => {
    if (!confirm(`Delete testimonial from "${t.clientName}"?`)) return;
    const prev = items;
    setItems(items.filter((x) => x.id !== t.id));
    const res = await fetch(`/api/testimonials/${t.id}`, { method: "DELETE" });
    if (!res.ok) {
      setItems(prev);
      toast("Delete failed", "error");
    } else toast("Testimonial deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Testimonials</h1>
          <p className="mt-1 text-sm text-slate-500">Manage client reviews displayed on your website.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(empty); setModal(true); }} className={btnPrimary}>+ Add Testimonial</button>
      </div>

      <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search testimonials…" className={`${inputCls} max-w-xs`} />

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className={cardCls}>
          <EmptyState icon="💬" title="No testimonials found" subtitle="Add your first client testimonial." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className={`${cardCls} p-6`}>
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <span key={i}>{i < t.rating ? "★" : "☆"}</span>)}
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-4">“{t.review}”</p>
              <div className="mt-4 flex items-center gap-3">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-500/15 font-bold text-indigo-500">{t.clientName.charAt(0)}</div>
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.clientName}</div>
                  <div className="text-xs text-slate-500">{t.company}</div>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => { setEditing(t); setForm({ ...t }); setModal(true); }}
                  className="flex-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-500 hover:bg-indigo-500/20"
                >
                  Edit
                </button>
                <button onClick={() => remove(t)} className="flex-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/20">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onPage={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Testimonial" : "Add Testimonial"}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Client Name *</label>
              <input required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Company</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Review *</label>
            <textarea required rows={4} value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Rating</label>
            <div className="flex gap-1 text-2xl">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, rating: i + 1 })}
                  className={i < form.rating ? "text-amber-400" : "text-slate-400/40"}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <ImageUpload value={form.photo} onChange={(url) => setForm({ ...form, photo: url })} label="Client Photo" />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving…" : editing ? "Update Testimonial" : "Create Testimonial"}</button>
            <button type="button" onClick={() => setModal(false)} className={btnGhost}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
