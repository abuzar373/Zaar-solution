import { NextResponse } from "next/server";

/**
 * Converts any thrown error into a JSON response with a helpful message.
 *
 * Every API route must use this. If a route throws, Next.js returns a 500 with
 * an EMPTY body — and the browser then fails with
 * "Unexpected end of JSON input" when it calls res.json().
 */
export function apiError(err: unknown, context = "request"): NextResponse {
  // Drizzle wraps driver errors ("Failed query: …") and keeps the real
  // Postgres/socket error in `cause`. Walk the chain so we can detect the
  // actual problem instead of always falling through to a generic 500.
  const chain: unknown[] = [];
  let current: unknown = err;
  for (let i = 0; i < 5 && current; i++) {
    chain.push(current);
    current = (current as { cause?: unknown })?.cause;
  }

  const message = chain
    .map((e) => (e instanceof Error ? e.message : String(e)))
    .join(" | ");
  const code = chain
    .map((e) => (e as NodeJS.ErrnoException)?.code)
    .find(Boolean);

  console.error(`[api] ${context} failed:`, code ?? "", message);

  // Database has not been provisioned yet.
  if (/relation .* does not exist/i.test(message)) {
    return NextResponse.json(
      {
        error:
          "The database tables have not been created yet. Run `npx drizzle-kit push` against your database, then `node scripts/seed.mjs`.",
      },
      { status: 503 }
    );
  }

  // Cannot reach the database at all.
  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "EAI_AGAIN" ||
    /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|Connection terminated|timeout expired/i.test(message)
  ) {
    return NextResponse.json(
      {
        error:
          "Cannot reach the database. Check that DATABASE_URL is set correctly in your environment variables.",
      },
      { status: 503 }
    );
  }

  // Wrong credentials / database name.
  if (/password authentication failed|role .* does not exist|database .* does not exist/i.test(message)) {
    return NextResponse.json(
      { error: "Database credentials are invalid. Verify your DATABASE_URL." },
      { status: 503 }
    );
  }

  // SSL problems (common with Supabase / Neon when sslmode is missing).
  if (/SSL|self.signed certificate|certificate/i.test(message)) {
    return NextResponse.json(
      {
        error:
          "Database SSL connection failed. Append ?sslmode=require to your DATABASE_URL.",
      },
      { status: 503 }
    );
  }

  // Unique constraint violation.
  if (code === "23505") {
    return NextResponse.json(
      { error: "That record already exists." },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { error: "Something went wrong on the server. Please try again." },
    { status: 500 }
  );
}
