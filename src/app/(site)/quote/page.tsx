"use client";

import { useState, type FormEvent } from "react";

const PROJECT_TYPES = [
  "Business Website",
  "Web Application",
  "Ecommerce Store",
  "Mobile App",
  "WordPress Site",
  "Custom Software",
  "UI/UX Design",
  "SEO Campaign",
];

const BUDGETS = ["Under $1,000", "$1,000 – $5,000", "$5,000 – $10,000", "$10,000 – $25,000", "$25,000+"];

const initial = { name: "", email: "", phone: "", business: "", projectType: "", budget: "", deadline: "", description: "" };

export default function QuotePage() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setSuccess(true);
      setForm(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400";

  return (
    <div className="pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">Get Quote</span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            Request a <span className="text-indigo-500">free quote</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-slate-600 dark:text-slate-400">
            Share the details of your project and we&apos;ll send a tailored proposal.
          </p>
        </div>

        {success ? (
          <div className="mt-12 glass rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-12 text-center">
            <div className="text-5xl">✅</div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Quote request received!</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">We&apos;ll review your project and send a detailed proposal shortly.</p>
            <button onClick={() => setSuccess(false)} className="mt-6 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors">
              Submit another request
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-8">
            {error && <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</div>}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name *</label>
                <input required value={form.name} onChange={set("name")} placeholder="John Doe" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email *</label>
                <input required type="email" value={form.email} onChange={set("email")} placeholder="john@company.com" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Phone</label>
                <input value={form.phone} onChange={set("phone")} placeholder="+1 555 000 1234" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Business</label>
                <input value={form.business} onChange={set("business")} placeholder="Your business name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Project Type</label>
                <select value={form.projectType} onChange={set("projectType")} className={inputCls}>
                  <option value="">Select project type</option>
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Budget</label>
                <select value={form.budget} onChange={set("budget")} className={inputCls}>
                  <option value="">Select budget range</option>
                  {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Deadline</label>
                <input type="date" value={form.deadline} onChange={set("deadline")} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Project Description *</label>
                <textarea required minLength={10} rows={5} value={form.description} onChange={set("description")} placeholder="Describe your project, goals and key features…" className={inputCls} />
              </div>
            </div>
            <button
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Submitting…" : "Request Quote"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
