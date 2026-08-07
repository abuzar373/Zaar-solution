"use client";

import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@abuzarsoftware.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async (eEmail = email, ePassword = password) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: eEmail, password: ePassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      // Use window.location.href to perform a hard redirect ensuring cookies are sent cleanly
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    doLogin();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20 pb-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="blob absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/25" />
        <div className="blob blob-slow absolute bottom-0 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20" />
      </div>
      <div className="glass w-full max-w-md rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 p-8 shadow-2xl shadow-indigo-500/10">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-2xl font-black text-white shadow-lg shadow-indigo-500/30">
            A
          </span>
          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">Admin Portal Login</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to access the Abuzar Software Solutions Admin Dashboard
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-center">
          <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-300">Quick Access</p>
          <button
            type="button"
            disabled={loading}
            onClick={() => doLogin("admin@abuzarsoftware.com", "admin123")}
            className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Logging in..." : "⚡ One-Click Login as Admin"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Authenticating…" : "Sign In to Admin Dashboard"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Demo Admin Email: <span className="font-mono text-slate-700 dark:text-slate-300">admin@abuzarsoftware.com</span><br/>
          Demo Password: <span className="font-mono text-slate-700 dark:text-slate-300">admin123</span>
        </p>
      </div>
    </div>
  );
}
