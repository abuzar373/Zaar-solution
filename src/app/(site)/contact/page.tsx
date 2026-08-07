"use client";

import { useEffect, useState, type FormEvent } from "react";
import { parseApiResponse } from "@/lib/api-client";

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

const defaultContact = {
  email: "hello@abuzarsoftware.com",
  phone: "+92 300 1234567",
  address: "Suite 402, Tech Tower, Lahore, Pakistan",
  hours: "Mon – Sat, 9:00 AM – 7:00 PM",
};

export default function ContactPage() {
  const [form, setForm] = useState(initial);
  const [contact, setContact] = useState(defaultContact);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.contactInfo) {
          setContact((prev) => ({ ...prev, ...d.settings.contactInfo }));
        }
      })
      .catch(() => {});
  }, []);

  const set = (key: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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
      const data = await parseApiResponse<{ error?: string }>(res);
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-500">Contact</span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
            Let&apos;s <span className="text-indigo-500">talk</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-slate-600 dark:text-slate-400">
            Tell us about your project and we&apos;ll get back to you within 24 hours.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            {[
              { icon: "📧", label: "Email", value: contact.email },
              { icon: "📱", label: "Phone", value: contact.phone },
              { icon: "📍", label: "Office", value: contact.address },
              { icon: "🕘", label: "Hours", value: contact.hours },
            ].map((c) => (
              <div key={c.label} className="glass flex items-start gap-4 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.label}</div>
                  <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {success ? (
              <div className="glass rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-12 text-center">
                <div className="text-5xl">🎉</div>
                <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Message sent successfully!</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Thank you for reaching out. Our team will contact you within 24 hours.</p>
                <button onClick={() => setSuccess(false)} className="mt-6 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-8">
                {error && (
                  <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</div>
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
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
                >
                  {loading ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
