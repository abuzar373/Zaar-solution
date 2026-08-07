import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_ADMIN_EMAIL = "admin@abuzarsoftware.com";
export const DEFAULT_ADMIN_PASSWORD = "admin123";

export function getConfiguredAdmin() {
  return {
    email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
    name: (process.env.ADMIN_NAME || "Abuzar Ahmed").trim(),
  };
}

/**
 * Creates the initial admin only when the submitted credentials match the
 * explicitly configured bootstrap credentials. Existing users are never
 * overwritten and passwords are always stored as bcrypt hashes.
 */
export async function provisionAdminIfConfigured(email: string, password: string) {
  const configured = getConfiguredAdmin();
  if (email !== configured.email || password !== configured.password) return null;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(configured.password, 12);
  try {
    const [created] = await db
      .insert(users)
      .values({
        name: configured.name,
        email: configured.email,
        passwordHash,
        role: "admin",
      })
      .returning();
    return created;
  } catch {
    // Another serverless request may have created the same user concurrently.
    const [createdByAnotherRequest] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return createdByAnotherRequest ?? null;
  }
}
