"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  EmptyState,
  ImageUpload,
  Modal,
  Spinner,
  btnGhost,
  btnPrimary,
  cardCls,
  inputCls,
  useToast,
} from "@/components/admin/ui";

type Service = {
  id: number;
  title: string;
  icon: string;
  description: string;
  image: string;
  sortOrder: number;
};

const empty = { title: "", icon: "💻", description: "", image: "", sortOrder: 0 };

export default function AdminServices() {
  const toast = useToast();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/services");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/services/${editing.id}` : "/api/services", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast(editing ? "Service updated" : "Service created");
      setModal(false);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Service) => {
    if (!confirm(`Delete "${s.title}"?`)) return;
    const prev = items;
    setItems(items.filter((x) => x.id !== s.id));
    const res = await fetch(`/api/services/${s.id}`, { method: "DELETE" });
    if (!res.ok) {
      setItems(prev);
      toast("Delete failed", "error");
    } else toast("Service deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the services offered on your website.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(empty); setModal(true); }} className={btnPrimary}>+ Add Service</button>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className={cardCls}>
          <EmptyState icon="🛠️" title="No services yet" subtitle="Add your first service to display it on the website." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <div key={s.id} className={`${cardCls} p-6`}>
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-500/10 text-2xl">{s.icon}</span>
                <span className="text-xs text-slate-400">Order: {s.sortOrder}</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500 line-clamp-3">{s.description}</p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => { setEditing(s); setForm({ ...s }); setModal(true); }}
                  className="flex-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-500 hover:bg-indigo-500/20"
                >
                  Edit
                </button>
                <button onClick={() => remove(s)} className="flex-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/20">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Service" : "Add Service"}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Icon (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description *</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputCls} />
          </div>
          <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Service Image (optional)" />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving…" : editing ? "Update Service" : "Create Service"}</button>
            <button type="button" onClick={() => setModal(false)} className={btnGhost}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
