import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="blob absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/25" />
        <div className="blob blob-slow absolute bottom-0 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20" />
      </div>
      <h1 className="text-8xl font-black bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page not found</h2>
      <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3.5 font-semibold text-white shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5 transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
