import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * First-run safety net.
 *
 * If the `users` table is completely empty (fresh clone, fresh database,
 * or the seed script was never run) this creates the default admin account
 * so you are never locked out of /admin.
 *
 * It ONLY runs when there are zero users — it will never overwrite or reset
 * an existing account.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  if (count > 0) return;

  const email = (process.env.ADMIN_EMAIL ?? "admin@abuzarsoftware.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const name = process.env.ADMIN_NAME ?? "Abuzar Ahmed";

  const passwordHash = await bcrypt.hash(password, 10);

  await db
    .insert(users)
    .values({ name, email, passwordHash, role: "admin" })
    .onConflictDoNothing();

  console.log(`[auth] No users found — created default admin: ${email}`);
}
