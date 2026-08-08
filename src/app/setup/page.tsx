"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Health = {
  ok: boolean;
  error?: string;
  hint?: string;
  database?: { host: string; connected: boolean; ssl: boolean; provider: string };
  schema?: { ready: boolean; missingTables: string[]; hint?: string };
  counts?: Record<string, number>;
  authSecretSet?: boolean;
};

function Row({
  label,
  ok,
  value,
  fix,
}: {
  label: string;
  ok: boolean;
  value: string;
  fix?: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200/60 dark:border-white/10 py-4 last:border-0">
      <span className={`mt-0.5 text-lg ${ok ? "text-emerald-500" : "text-rose-500"}`}>
        {ok ? "✓" : "✕"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{label}</div>
        <div className="mt-0.5 break-words text-sm text-slate-600 dark:text-slate-400">{value}</div>
        {!ok && fix && (
          <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            <strong>Fix:</strong> {fix}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SetupPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [message, setMessage] = useState("");

  const check = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/health?full=1", { cache: "no-store" });
      setHealth(await res.json());
    } catch {
      setHealth({ ok: false, error: "Could not reach the server." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  const initialize = async () => {
    setInitializing(true);
    setMessage("");
    try {
      const res = await fetch("/api/setup", { method: "POST" });
      const data = await res.json();
      setMessage(
        res.ok
          ? "✓ Database initialised successfully. You can sign in now."
          : `✕ ${data.error ?? "Setup failed."}`
      );
      await check();
    } catch {
      setMessage("✕ Could not reach the server.");
    } finally {
      setInitializing(false);
    }
  };

  const dbOk = Boolean(health?.database?.connected);
  const schemaOk = Boolean(health?.schema?.ready);
  const hasAdmin = (health?.counts?.users ?? 0) > 0;
  const allGood = dbOk && schemaOk && hasAdmin;

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-2xl font-black text-white">
            A
          </span>
          <h1 className="mt-5 text-3xl font-black text-slate-900 dark:text-white">
            Setup &amp; Diagnostics
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This page tells you exactly what is working and what needs fixing.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="spinner h-10 w-10" />
          </div>
        ) : (
          <>
            <div
              className={`mt-10 rounded-2xl border p-6 text-center ${
                allGood
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-rose-500/30 bg-rose-500/10"
              }`}
            >
              <div className="text-4xl">{allGood ? "🎉" : "⚠️"}</div>
              <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                {allGood ? "Everything is working!" : "Setup incomplete"}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {allGood
                  ? "Your website, forms and admin panel are fully functional."
                  : "Follow the fixes below, then press Re-check."}
              </p>
            </div>

            <div className="glass mt-6 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-6">
              <Row
                label="Database connection"
                ok={dbOk}
                value={
                  dbOk
                    ? `Connected to ${health?.database?.provider} (${health?.database?.host})`
                    : health?.error ?? "Not connected"
                }
                fix="Set DATABASE_URL in your hosting provider's environment variables, then redeploy. For Supabase use the Transaction pooler URL (port 6543)."
              />
              <Row
                label="Database tables"
                ok={schemaOk}
                value={
                  schemaOk
                    ? "All 7 tables exist"
                    : `Missing: ${health?.schema?.missingTables?.join(", ") || "unknown"}`
                }
                fix="Press the 'Initialise Database' button below."
              />
              <Row
                label="Admin account"
                ok={hasAdmin}
                value={hasAdmin ? `${health?.counts?.users} user(s) registered` : "No admin user"}
                fix="Press 'Initialise Database' — it creates the default admin."
              />
              <Row
                label="AUTH_SECRET"
                ok={Boolean(health?.authSecretSet)}
                value={
                  health?.authSecretSet
                    ? "Configured"
                    : "Not set — using an insecure fallback"
                }
                fix="Add AUTH_SECRET (a long random string) to your environment variables and redeploy. Logins still work without it, but sessions are less secure."
              />
            </div>

            {dbOk && health?.counts && (
              <div className="glass mt-6 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Data in your database
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.entries(health.counts).map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-slate-500/5 px-3 py-2.5 text-center">
                      <div className="text-xl font-bold text-indigo-500">{v}</div>
                      <div className="text-[11px] capitalize text-slate-500">{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message && (
              <div className="mt-6 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm">
                {message}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={initialize}
                disabled={initializing || !dbOk}
                title={!dbOk ? "Fix the database connection first" : undefined}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {initializing ? "Initialising…" : "Initialise Database"}
              </button>
              <button
                onClick={check}
                className="rounded-xl border border-slate-300/60 dark:border-white/10 px-6 py-3 text-sm font-semibold"
              >
                Re-check
              </button>
              {allGood && (
                <Link
                  href="/login"
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  Go to Admin Login →
                </Link>
              )}
            </div>

            {allGood && (
              <div className="mt-8 rounded-2xl border border-indigo-500/25 bg-indigo-500/5 p-6 text-center text-sm">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Admin credentials
                </div>
                <div className="mt-2 text-slate-600 dark:text-slate-400">
                  admin@abuzarsoftware.com &nbsp;/&nbsp; admin123
                </div>
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Change this password under Admin → My Profile.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
