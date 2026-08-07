"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyState,
  Modal,
  Pagination,
  Spinner,
  cardCls,
  inputCls,
  useToast,
} from "@/components/admin/ui";

export type InboxItem = { id: number; status: string; createdAt: string } & Record<string, unknown>;

type Field = { key: string; label: string };

export default function Inbox({
  endpoint,
  resource,
  title,
  subtitle,
  icon,
  statuses,
  nameKey,
  emailKey,
  summaryKey,
  bodyKey,
  detailFields,
  statusColors,
}: {
  endpoint: string;
  resource: "contacts" | "quotes";
  title: string;
  subtitle: string;
  icon: string;
  statuses: string[];
  nameKey: string;
  emailKey: string;
  summaryKey: string;
  bodyKey: string;
  detailFields: Field[];
  statusColors: Record<string, string>;
}) {
  const toast = useToast();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewing, setViewing] = useState<InboxItem | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10", status });
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`${endpoint}?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setPages(data.pages ?? 1);
    setTotal(data.total ?? 0);
    setSelected(new Set());
    setLoading(false);
  }, [endpoint, page, q, status]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allOnPageSelected = items.length > 0 && items.every((i) => selected.has(i.id));
  const toggleAll = () => {
    setSelected(allOnPageSelected ? new Set() : new Set(items.map((i) => i.id)));
  };

  const setItemStatus = async (item: InboxItem, next: string) => {
    const prev = items;
    setItems(items.map((x) => (x.id === item.id ? { ...x, status: next } : x)));
    if (viewing?.id === item.id) setViewing({ ...item, status: next });
    const res = await fetch(`${endpoint}/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setItems(prev);
      toast("Update failed", "error");
    } else toast(`Marked as ${next}`);
  };

  const remove = async (item: InboxItem) => {
    if (!confirm("Delete this submission?")) return;
    const prev = items;
    setItems(items.filter((x) => x.id !== item.id));
    setViewing(null);
    const res = await fetch(`${endpoint}/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      setItems(prev);
      toast("Delete failed", "error");
    } else {
      setTotal((t) => Math.max(0, t - 1));
      toast("Deleted");
    }
  };

  const bulk = async (action: "delete" | "status", value?: string) => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (action === "delete" && !confirm(`Delete ${ids.length} selected submission(s)?`)) return;

    setBusy(true);
    const prev = items;
    if (action === "delete") setItems(items.filter((x) => !selected.has(x.id)));
    else setItems(items.map((x) => (selected.has(x.id) ? { ...x, status: value! } : x)));

    try {
      const res = await fetch(`/api/bulk/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids, status: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bulk action failed");
      toast(
        action === "delete"
          ? `Deleted ${data.affected} submission(s)`
          : `Updated ${data.affected} submission(s)`
      );
      setSelected(new Set());
      load();
    } catch (err) {
      setItems(prev);
      toast(err instanceof Error ? err.message : "Bulk action failed", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {subtitle} {total > 0 && <span className="font-medium">· {total} total</span>}
          </p>
        </div>
        <a
          href={`/api/export/${resource}`}
          className="rounded-xl border border-slate-300/60 dark:border-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-slate-500/10 transition-colors"
        >
          ⬇ Export CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search…"
          className={`${inputCls} max-w-xs`}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className={`${inputCls} w-40`}
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="toast-in flex flex-wrap items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
          <span className="text-sm font-semibold text-indigo-500">{selected.size} selected</span>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                disabled={busy}
                onClick={() => bulk("status", s)}
                className="rounded-lg border border-slate-300/60 dark:border-white/15 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-slate-500/10 disabled:opacity-50"
              >
                Mark {s}
              </button>
            ))}
            <button
              disabled={busy}
              onClick={() => bulk("delete")}
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 disabled:opacity-50"
            >
              Delete selected
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-500/10"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className={cardCls}>
          <EmptyState icon={icon} title="No submissions found" subtitle="New submissions from the website will appear here." />
        </div>
      ) : (
        <div className={`${cardCls} overflow-x-auto`}>
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAll}
                    aria-label="Select all on this page"
                    className="h-4 w-4 accent-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-4">From</th>
                <th className="px-5 py-4">Summary</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-slate-200/40 dark:border-white/5 hover:bg-slate-500/5 ${
                    selected.has(item.id) ? "bg-indigo-500/5" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleOne(item.id)}
                      aria-label={`Select submission ${item.id}`}
                      className="h-4 w-4 accent-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{String(item[nameKey] ?? "")}</div>
                    <div className="text-xs text-slate-500">{String(item[emailKey] ?? "")}</div>
                  </td>
                  <td className="max-w-[240px] truncate px-5 py-4 text-slate-600 dark:text-slate-400">
                    {String(item[summaryKey] || item[bodyKey] || "")}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColors[item.status] ?? "bg-slate-500/15 text-slate-500"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => setViewing(item)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-500 hover:bg-indigo-500/10">View</button>
                    <button onClick={() => remove(item)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onPage={setPage} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Submission Details">
        {viewing && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {detailFields.map((f) => (
                <div key={f.key} className="rounded-xl bg-slate-500/5 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{f.label}</div>
                  <div className="mt-0.5 text-sm text-slate-900 dark:text-white break-words">
                    {String(viewing[f.key] || "—")}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-500/5 px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Message</div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                {String(viewing[bodyKey] ?? "")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Set status:</span>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setItemStatus(viewing, s)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    viewing.status === s
                      ? "bg-indigo-500 text-white"
                      : "border border-slate-300/60 dark:border-white/10 hover:bg-slate-500/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-3 border-t border-slate-200/60 dark:border-white/10 pt-4">
              <a
                href={`mailto:${String(viewing[emailKey] ?? "")}`}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
              >
                ✉ Reply by Email
              </a>
              <button
                onClick={() => remove(viewing)}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
