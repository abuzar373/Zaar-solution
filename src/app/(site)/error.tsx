"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] render error:", error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="glass w-full max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/5 p-9 text-center">
        <div className="text-5xl">⚠️</div>
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          We couldn&apos;t load this page right now. Please try again in a moment.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-300/60 dark:border-white/10 px-5 py-2.5 text-sm font-semibold"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
