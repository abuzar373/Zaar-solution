import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { bootstrapDatabase } from "@/lib/bootstrap";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

/**
 * Server-rendered admin guard.
 *
 * The session is verified HERE, on the server, before any HTML is sent. That
 * means the dashboard arrives fully rendered — no loading spinner, no
 * client-side session fetch that can hang, and no redirect flash.
 *
 * Previously this was a client component that showed a spinner while it
 * fetched /api/auth/me; if that request was slow or failed, the admin panel
 * appeared stuck on "Verifying your session…" forever.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Make sure the tables exist (fresh Supabase project, first deploy, …).
  await bootstrapDatabase().catch((err) => {
    console.error("[admin] bootstrap failed:", err?.message ?? err);
  });

  const user = await requireAdmin();
  if (!user) redirect("/login?next=/admin");

  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AdminShell>
  );
}
