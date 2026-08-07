"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  EmptyState,
  Modal,
  Spinner,
  btnGhost,
  btnPrimary,
  cardCls,
  inputCls,
  useToast,
} from "@/components/admin/ui";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const empty = { name: "", email: "", password: "", role: "admin" };

export default function AdminUsers() {
  const toast = useToast();
  const [items, setItems] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setItems(data.items ?? []);
      setCurrentUserId(data.currentUserId ?? null);
    } catch {
      setItems([]);
      toast("Could not load users", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/users/${editing.id}` : "/api/users", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast(editing ? "User updated" : "User created");
      setModal(false);
      load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u: User) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    const prev = items;
    setItems(items.filter((x) => x.id !== u.id));
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setItems(prev);
      toast(data.error ?? "Delete failed", "error");
    } else toast("User deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage who can sign in to the admin panel.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(empty); setModal(true); }}
          className={btnPrimary}
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className={cardCls}>
          <EmptyState icon="👤" title="No users yet" subtitle="Add an admin account to get started." />
        </div>
      ) : (
        <div className={`${cardCls} overflow-x-auto`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-slate-200/40 dark:border-white/5 hover:bg-slate-500/5">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 font-bold text-indigo-500">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {u.name}
                          {u.id === currentUserId && (
                            <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-500">
                      {u.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditing(u);
                        setForm({ name: u.name, email: u.email, password: "", role: u.role });
                        setModal(true);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-500 hover:bg-indigo-500/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(u)}
                      disabled={u.id === currentUserId}
                      title={u.id === currentUserId ? "You cannot delete your own account" : undefined}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit User" : "Add User"}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Password {editing ? "(leave blank to keep current)" : "*"}
            </label>
            <input
              required={!editing}
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editing ? "••••••••" : "At least 6 characters"}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              disabled={editing?.id === currentUserId}
              className={inputCls}
            >
              <option value="admin">Admin — full access</option>
              <option value="editor">Editor — cannot sign in to admin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Saving…" : editing ? "Update User" : "Create User"}
            </button>
            <button type="button" onClick={() => setModal(false)} className={btnGhost}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
