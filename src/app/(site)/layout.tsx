import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * The footer reads live contact details and social links from the database,
 * so every page in this group must render at request time. Without this the
 * footer would be frozen at build time — and the build would fail entirely on
 * hosts where the database is not reachable during `next build` (e.g. Vercel).
 */
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
