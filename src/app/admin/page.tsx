"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Spinner, cardCls } from "@/components/admin/ui";
import { parseApiResponse } from "@/lib/api-client";

type Stats = {
  counts: {
    projects: number;
    testimonials: number;
    contacts: number;
    quotes: number;
    services: number;
    newContacts: number;
    pendingQuotes: number;
  };
  charts: {
    contactsByMonth: { month: string; monthNum: string; count: number }[];
    quotesByMonth: { month: string; monthNum: string; count: number }[];
  };
  recent: {
    contacts: { id: number; fullName: string; email: string; service: string; createdAt: string; status: string }[];
    quotes: { id: number; name: string; email: string; projectType: string; createdAt: string; status: string }[];
  };
};

function BarChart({ data, color }: { data: { month: string; count: number }[]; color: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (data.length === 0) {
    return <div className="grid h-40 place-items-center text-sm text-slate-500">No data yet</div>;
  }
  return (
    <div className="flex h-40 items-end gap-3">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">{d.count}</span>
          <div
            className={`bar-grow w-full rounded-t-lg ${color}`}
            style={{ height: `${Math.max(8, (d.count / max) * 100)}%`, animationDelay: `${i * 0.08}s` }}
          />
          <span className="text-[11px] text-slate-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/stats")
      .then(async (response) => {
        const data = await parseApiResponse<Partial<Stats> & { error?: string }>(response);
        if (!response.ok) throw new Error(data.error ?? "Unable to load dashboard statistics");
        setStats(data as Stats);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Unable to load dashboard statistics");
      });
  }, []);

  if (error) {
    return (
      <div className={`${cardCls} mx-auto max-w-2xl p-8 text-center`}>
        <div className="text-4xl">⚠️</div>
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Admin database is not connected</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
        <p className="mt-4 rounded-xl bg-slate-500/5 p-4 text-left text-xs leading-6 text-slate-500">
          In Vercel, add DATABASE_URL using Supabase&apos;s Transaction Pooler connection string. Then redeploy and open /api/health to verify it.
        </p>
      </div>
    );
  }

  if (!stats) return <Spinner />;

  const cards = [
    { label: "Projects", value: stats.counts.projects, icon: "💼", href: "/admin/projects" },
    { label: "Services", value: stats.counts.services, icon: "🛠️", href: "/admin/services" },
    { label: "Testimonials", value: stats.counts.testimonials, icon: "💬", href: "/admin/testimonials" },
    { label: "Contact Requests", value: stats.counts.contacts, icon: "📥", href: "/admin/contacts" },
    { label: "Quote Requests", value: stats.counts.quotes, icon: "🧾", href: "/admin/quotes" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {(stats.counts.newContacts > 0 || stats.counts.pendingQuotes > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.counts.newContacts > 0 && (
            <Link href="/admin/contacts" className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
              🔔 {stats.counts.newContacts} new contact message{stats.counts.newContacts > 1 ? "s" : ""}
            </Link>
          )}
          {stats.counts.pendingQuotes > 0 && (
            <Link href="/admin/quotes" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-500 hover:bg-indigo-500/20">
              🔔 {stats.counts.pendingQuotes} pending quote request{stats.counts.pendingQuotes > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`${cardCls} p-5 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all`}>
            <div className="text-2xl">{c.icon}</div>
            <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{c.value}</div>
            <div className="mt-1 text-xs font-medium text-slate-500">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${cardCls} p-6`}>
          <h2 className="font-semibold text-slate-900 dark:text-white">Contact Messages by Month</h2>
          <div className="mt-6">
            <BarChart data={stats.charts.contactsByMonth} color="bg-gradient-to-t from-indigo-600 to-violet-400" />
          </div>
        </div>
        <div className={`${cardCls} p-6`}>
          <h2 className="font-semibold text-slate-900 dark:text-white">Quote Requests by Month</h2>
          <div className="mt-6">
            <BarChart data={stats.charts.quotesByMonth} color="bg-gradient-to-t from-fuchsia-600 to-pink-400" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${cardCls} p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Contacts</h2>
            <Link href="/admin/contacts" className="text-sm font-medium text-indigo-500 hover:text-indigo-400">View all →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {stats.recent.contacts.length === 0 && <p className="text-sm text-slate-500">No contact messages yet.</p>}
            {stats.recent.contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-500/5 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{c.fullName}</div>
                  <div className="text-xs text-slate-500">{c.service || c.email}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.status === "new" ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className={`${cardCls} p-6`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Quotes</h2>
            <Link href="/admin/quotes" className="text-sm font-medium text-indigo-500 hover:text-indigo-400">View all →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {stats.recent.quotes.length === 0 && <p className="text-sm text-slate-500">No quote requests yet.</p>}
            {stats.recent.quotes.map((qt) => (
              <div key={qt.id} className="flex items-center justify-between rounded-xl bg-slate-500/5 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{qt.name}</div>
                  <div className="text-xs text-slate-500">{qt.projectType || qt.email}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${qt.status === "pending" ? "bg-amber-500/15 text-amber-500" : "bg-emerald-500/15 text-emerald-500"}`}>
                  {qt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
