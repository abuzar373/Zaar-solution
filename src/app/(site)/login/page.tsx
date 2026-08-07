"use client";

import { useEffect, useState, type FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@abuzarsoftware.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState("/admin");

  // Read ?next= from the URL without useSearchParams (avoids a Suspense boundary).
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("next");
    if (param && param.startsWith("/admin")) setNext(param);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Login failed (${res.status})`);
      // Hard navigation guarantees the new session cookie is used for the
      // very next request (and re-runs the middleware guard cleanly).
      window.location.href = next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="blob absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/25" />
        <div className="blob blob-slow absolute bottom-0 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20" />
      </div>
      <div className="glass w-full max-w-md rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 p-9 shadow-2xl shadow-indigo-500/10">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-2xl font-black text-white shadow-lg shadow-indigo-500/30">
            A
          </span>
          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">Admin Login</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Sign in to manage Abuzar Software Solutions</p>
        </div>
        {error && <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</div>}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div className="mt-6 rounded-xl border border-indigo-500/25 bg-indigo-500/5 px-4 py-3 text-center text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-indigo-500">Demo credentials</span>
          <br />
          admin@abuzarsoftware.com / admin123
          <br />
          <span className="text-slate-500">(already filled in — just press Sign In)</span>
        </div>
      </div>
    </div>
  );
}
