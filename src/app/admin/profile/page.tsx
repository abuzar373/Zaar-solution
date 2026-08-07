"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Spinner, btnPrimary, cardCls, inputCls, useToast } from "@/components/admin/ui";

export default function AdminProfile() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setForm((f) => ({ ...f, name: d.user.name, email: d.user.email }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast("New passwords do not match", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      toast("Profile updated successfully");
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update your account details and password.</p>
      </div>

      <form onSubmit={save} className={`${cardCls} max-w-2xl p-7 space-y-6`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-white/10 pt-6">
          <h2 className="font-semibold text-slate-900 dark:text-white">Change Password</h2>
          <p className="mt-1 text-xs text-slate-500">
            Leave blank to keep your current password. Required when changing your email.
          </p>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Current Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">New Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className={inputCls}
                />
              </div>
            </div>
            {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-xs font-medium text-rose-500">Passwords do not match.</p>
            )}
          </div>
        </div>

        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
