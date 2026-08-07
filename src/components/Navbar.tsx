"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled
          ? "glass bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/60 dark:border-white/10 shadow-lg shadow-indigo-500/5"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white font-black shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            A
          </span>
          <span className="font-bold tracking-tight text-slate-900 dark:text-white">
            Abuzar<span className="text-indigo-500"> Software</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-500/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center rounded-lg border border-slate-300/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/10 transition-colors"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <Link
            href="/quote"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
          >
            Get Quote
          </Link>
        </div>

        <button
          className="md:hidden h-10 w-10 grid place-items-center rounded-lg border border-slate-300/60 dark:border-white/10"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {open && (
        <div className="md:hidden glass bg-white/90 dark:bg-slate-950/90 border-t border-slate-200/60 dark:border-white/10 px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === l.href
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={toggleTheme}
              className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300/60 dark:border-white/10 text-sm font-medium"
            >
              {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <Link
              href="/quote"
              className="flex-1 text-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
            >
              Get Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
