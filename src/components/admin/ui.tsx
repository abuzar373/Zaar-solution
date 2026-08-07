"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ---------- Toasts ---------- */

type Toast = { id: number; message: string; type: "success" | "error" };
const ToastContext = createContext<(message: string, type?: "success" | "error") => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-in glass flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
              t.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            <span>{t.type === "success" ? "✓" : "✕"}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`toast-in relative w-full ${wide ? "max-w-3xl" : "max-w-xl"} max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#0d1424] p-7 shadow-2xl`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-500/10 text-slate-500">
            ✕
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Image upload with preview ---------- */

export function ImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="flex items-start gap-4">
        <div
          onClick={() => inputRef.current?.click()}
          className="grid h-24 w-32 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300/70 dark:border-white/15 bg-slate-500/5 hover:border-indigo-500/60 transition-colors"
        >
          {uploading ? (
            <div className="spinner h-6 w-6" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-center text-xs text-slate-400 px-2">Click to upload</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="w-full rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-xs font-medium text-rose-500 hover:text-rose-400">
              Remove image
            </button>
          )}
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ---------- Misc ---------- */

export function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="spinner h-10 w-10" />
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="py-20 text-center text-slate-500">
      <div className="text-5xl">{icon}</div>
      <p className="mt-4 font-semibold text-slate-700 dark:text-slate-300">{title}</p>
      <p className="mt-1 text-sm">{subtitle}</p>
    </div>
  );
}

export function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-lg border border-slate-300/60 dark:border-white/10 px-3.5 py-2 text-sm font-medium disabled:opacity-40 hover:bg-slate-500/10"
      >
        ← Prev
      </button>
      <span className="px-3 text-sm text-slate-500">
        Page {page} of {pages}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="rounded-lg border border-slate-300/60 dark:border-white/10 px-3.5 py-2 text-sm font-medium disabled:opacity-40 hover:bg-slate-500/10"
      >
        Next →
      </button>
    </div>
  );
}

export const inputCls =
  "w-full rounded-xl border border-slate-300/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400";

export const btnPrimary =
  "rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0";

export const btnGhost =
  "rounded-xl border border-slate-300/60 dark:border-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-slate-500/10 transition-colors";

export const cardCls =
  "glass rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5";
