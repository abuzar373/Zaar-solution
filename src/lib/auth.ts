import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET =
  process.env.AUTH_SECRET?.trim() || "abuzar-software-solutions-secret-key";
export const AUTH_COOKIE = "abuzar_admin_token";

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

export function signToken(payload: { uid: number; email: string }, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const body = b64url(
    JSON.stringify({ ...payload, exp: Date.now() + maxAgeSeconds * 1000 })
  );
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string | undefined | null): { uid: number; email: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (typeof payload.uid !== "number") return null;
    return { uid: payload.uid, email: String(payload.email) };
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  return verifyToken(store.get(AUTH_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  try {
    const [user] = await db.select().from(users).where(eq(users.id, session.uid)).limit(1);
    if (!user || user.role !== "admin") return null;
    return user;
  } catch (error) {
    console.error("[auth] Unable to verify admin against database", error);
    return null;
  }
}
