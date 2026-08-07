"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ToastProvider } from "@/components/admin/ui";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/projects", label: "Portfolio & Projects", icon: "💼" },
  { href: "/admin/services", label: "Services", icon: "🛠️" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "💬" },
  { href: "/admin/contacts", label: "Contact Requests", icon: "📥" },
  { href: "/admin/quotes", label: "Quote Requests", icon: "🧾" },
  { href: "/admin/settings", label: "Website Content", icon: "⚙️" },
  { href: "/admin/profile", label: "Admin Account", icon: "🔐" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setUser(d.user);
        setChecking(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b16] text-white">
        <div className="text-center">
          <div className="spinner mx-auto h-12 w-12" />
          <p className="mt-4 text-sm font-medium text-slate-400">Loading Admin Control Panel...</p>
        </div>
      </div>
    );
  }

  const activeLabel = NAV.find((n) => n.href === pathname)?.label ?? "Admin";

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-[#0a0f1e]/95 glass transition-transform lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center gap-3 border-b border-slate-200/60 dark:border-white/10 px-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 font-black text-white shadow-lg shadow-indigo-500/30">
              A
            </span>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Abuzar Admin</div>
              <div className="text-[11px] text-indigo-500 font-medium">Software House CMS</div>
            </div>
          </div>

          <nav className="space-y-1.5 p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
            {NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-500/10 hover:text-slate-900 dark:hover:text-white border border-transparent"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute inset-x-0 bottom-0 border-t border-slate-200/60 dark:border-white/10 p-4 bg-white/50 dark:bg-[#0a0f1e]/50">
            <Link href="/admin/profile" className="mb-3 block px-1 group hover:opacity-80 transition-opacity">
              <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>{user?.name || "Admin"}</span>
                <span className="text-[10px] text-indigo-500 group-hover:underline">Edit ⚙️</span>
              </div>
              <div className="truncate text-[11px] text-slate-500">{user?.email}</div>
            </Link>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 rounded-lg border border-slate-300/60 dark:border-white/10 px-3 py-2 text-xs font-medium hover:bg-slate-500/10 transition-colors"
              >
                {dark ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button
                onClick={logout}
                className="flex-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-xs lg:hidden" onClick={() => setOpen(false)} />
        )}

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-[#070b16]/80 glass px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300/60 dark:border-white/10 lg:hidden text-slate-700 dark:text-slate-300"
              >
                ☰
              </button>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {activeLabel}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/profile"
                className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-300/60 dark:border-white/10 px-3 py-1.5 text-xs font-medium hover:bg-slate-500/10 transition-colors"
              >
                <span>👤</span> Profile Settings
              </Link>
              <Link
                href="/"
                target="_blank"
                className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 text-xs font-semibold hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5"
              >
                <span>Live Site</span> ↗
              </Link>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>

          <footer className="border-t border-slate-200/40 dark:border-white/5 py-4 px-6 text-center text-xs text-slate-500">
            Abuzar Software Solutions — Admin Control Panel v1.0
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}
