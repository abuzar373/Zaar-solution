"use client";

import { useState, type FormEvent } from "react";

const SERVICES = [
  "Website Development",
  "WordPress Development",
  "React Development",
  "Node.js Development",
  "Ecommerce Website",
  "SEO",
  "UI/UX Design",
  "Mobile App Development",
  "Software Development",
];

const BUDGETS = ["Under $1,000", "$1,000 – $5,000", "$5,000 – $10,000", "$10,000 – $25,000", "$25,000+"];

const initial = { fullName: "", email: "", phone: "", company: "", service: "", budget: "", message: "" };

const inputCls =
  "w-full rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400";

export default function ContactForm() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set =
    (key: keyof typeof initial) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
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

  if (success) {
    return (
      <div className="glass rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-12 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Message sent successfully!</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Thank you for reaching out. Our team will contact you within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-8">
      {error && (
        <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {error}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full Name *</label>
          <input required value={form.fullName} onChange={set("fullName")} placeholder="John Doe" className={inputCls} />
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
          <label className="mb-1.5 block text-sm font-medium">Company</label>
          <input value={form.company} onChange={set("company")} placeholder="Acme Inc." className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Service Required</label>
          <select value={form.service} onChange={set("service")} className={inputCls}>
            <option value="">Select a service</option>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
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
          <label className="mb-1.5 block text-sm font-medium">Message *</label>
          <textarea required minLength={10} rows={5} value={form.message} onChange={set("message")} placeholder="Tell us about your project…" className={inputCls} />
        </div>
      </div>
      <button
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
