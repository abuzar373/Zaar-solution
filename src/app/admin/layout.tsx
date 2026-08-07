"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ToastProvider } from "@/components/admin/ui";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/projects", label: "Portfolio & Projects", icon: "💼" },
  { href: "/admin/services", label: "Services", icon: "🛠️" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "💬" },
  { href: "/admin/contacts", label: "Contact Requests", icon: "📥" },
  { href: "/admin/quotes", label: "Quote Requests", icon: "🧾" },
  { href: "/admin/settings", label: "Website Content", icon: "⚙️" },
  { href: "/admin/users", label: "Users", icon: "👤" },
  { href: "/admin/profile", label: "My Profile", icon: "🔑" },
];

type User = { name: string; email: string };
type Phase = "checking" | "ready" | "error";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  const checkSession = useCallback(async () => {
    setPhase("checking");
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (res.status === 401) {
        // Session missing/expired/invalid. Clear the cookie first, otherwise the
        // middleware would see a stale cookie and bounce us straight back here.
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        window.location.href = `/login?next=${encodeURIComponent(pathname)}`;
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || `Server responded with ${res.status}.`);
        setPhase("error");
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setPhase("ready");
    } catch {
      setErrorMsg("Could not reach the server. Check your connection and try again.");
      setPhase("error");
    }
  }, [pathname]);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    checkSession();
  }, [checkSession]);

  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (phase === "checking") {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <div className="spinner mx-auto h-12 w-12" />
          <p className="mt-4 text-sm text-slate-500">Verifying your session…</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="glass w-full max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center">
          <div className="text-4xl">⚠️</div>
          <h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Couldn&apos;t load the admin panel
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{errorMsg}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={checkSession}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Retry
            </button>
            <button
              onClick={logout}
              className="rounded-xl border border-slate-300/60 dark:border-white/10 px-5 py-2.5 text-sm font-semibold"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1e]/90 glass transition-transform lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center gap-2 border-b border-slate-200/60 dark:border-white/10 px-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 font-black text-white">
              A
            </span>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Abuzar Admin</div>
              <div className="text-[11px] text-slate-500">Control Panel</div>
            </div>
          </div>
          <nav className="space-y-1 p-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-500/10 hover:text-slate-900 dark:hover:text-white border border-transparent"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute inset-x-0 bottom-0 border-t border-slate-200/60 dark:border-white/10 p-4">
            <div className="mb-3 px-1">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</div>
              <div className="truncate text-xs text-slate-500">{user?.email}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleTheme} className="flex-1 rounded-lg border border-slate-300/60 dark:border-white/10 px-3 py-2 text-xs font-medium hover:bg-slate-500/10">
                {dark ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button onClick={logout} className="flex-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/20">
                Logout
              </button>
            </div>
          </div>
        </aside>

        {open && <div className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => setOpen(false)} />}

        {/* Main */}
        <div className="flex-1 lg:pl-64">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-[#070b16]/80 glass px-4 sm:px-6">
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300/60 dark:border-white/10 lg:hidden">
              ☰
            </button>
            <div className="hidden lg:block text-sm text-slate-500">
              {NAV.find((n) => n.href === pathname)?.label ?? "Admin"}
            </div>
            <Link href="/" target="_blank" className="rounded-lg border border-slate-300/60 dark:border-white/10 px-4 py-2 text-sm font-medium hover:bg-slate-500/10">
              View Website ↗
            </Link>
          </header>
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
