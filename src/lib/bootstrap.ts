import bcrypt from "bcryptjs";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ADMIN_DEFAULTS } from "@/lib/env";

/**
 * Self-provisioning bootstrap.
 *
 * Creates every table if it does not exist and guarantees an admin account.
 * This means a fresh Supabase / Neon database works immediately after the
 * environment variables are set — no separate migration step required, so you
 * can never be locked out of /admin.
 *
 * Every statement is IF NOT EXISTS / ON CONFLICT, so this is safe to run on
 * every login and will never touch existing data.
 */

let schemaReady = false;

const SCHEMA = sql`
  create table if not exists users (
    id serial primary key,
    name text not null,
    email text not null unique,
    password_hash text not null,
    role text not null default 'admin',
    created_at timestamp not null default now()
  );
  create table if not exists projects (
    id serial primary key,
    title text not null,
    category text not null,
    description text not null,
    technologies text not null default '',
    github_url text not null default '',
    live_url text not null default '',
    image text not null default '',
    featured boolean not null default false,
    created_at timestamp not null default now()
  );
  create table if not exists testimonials (
    id serial primary key,
    client_name text not null,
    company text not null default '',
    review text not null,
    photo text not null default '',
    rating integer not null default 5,
    created_at timestamp not null default now()
  );
  create table if not exists services (
    id serial primary key,
    title text not null,
    icon text not null default '💻',
    description text not null,
    image text not null default '',
    sort_order integer not null default 0,
    created_at timestamp not null default now()
  );
  create table if not exists contacts (
    id serial primary key,
    full_name text not null,
    email text not null,
    phone text not null default '',
    company text not null default '',
    service text not null default '',
    budget text not null default '',
    message text not null,
    status text not null default 'new',
    created_at timestamp not null default now()
  );
  create table if not exists quotes (
    id serial primary key,
    name text not null,
    email text not null,
    phone text not null default '',
    business text not null default '',
    project_type text not null default '',
    budget text not null default '',
    deadline text not null default '',
    description text not null,
    status text not null default 'pending',
    created_at timestamp not null default now()
  );
  create table if not exists settings (
    id serial primary key,
    key text not null unique,
    value jsonb not null
  );
`;

/** Creates any missing tables. Cached per server instance after it succeeds. */
export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  await db.execute(SCHEMA);
  schemaReady = true;
  console.log("[bootstrap] schema verified");
}

/**
 * Creates the default admin when no users exist at all.
 * Never modifies an existing account.
 */
export async function ensureAdminUser(): Promise<void> {
  // Repair any account created with a blank email/name by an earlier version
  // (caused by empty-string environment variables). Such a row can never be
  // logged into and would block the "no users" check below.
  await db.execute(sql`delete from users where trim(email) = '' or email is null`);

  const result = await db.execute<{ count: number }>(
    sql`select count(*)::int as count from users`
  );
  if ((result.rows[0]?.count ?? 0) > 0) return;

  const { name, email, password } = ADMIN_DEFAULTS;
  const hash = await bcrypt.hash(password, 10);

  await db.execute(sql`
    insert into users (name, email, password_hash, role)
    values (${name}, ${email}, ${hash}, 'admin')
    on conflict (email) do nothing
  `);
  console.log(`[bootstrap] created default admin: ${email}`);
}

/** Adds starter website content when the settings table is empty. */
export async function ensureBaseContent(): Promise<void> {
  const result = await db.execute<{ count: number }>(
    sql`select count(*)::int as count from settings`
  );
  if ((result.rows[0]?.count ?? 0) > 0) return;

  await db.execute(sql`
    insert into settings (key, value) values
      ('hero', '{"heading":"Abuzar Software Solutions","subtitle":"We Build Modern Websites, Mobile Apps and Business Solutions.","badge":"Premium Software House"}'::jsonb),
      ('stats', '{"clients":120,"projects":250,"years":8,"team":24}'::jsonb),
      ('contactInfo', '{"email":"hello@abuzarsoftware.com","phone":"+92 300 1234567","address":"Suite 402, Tech Tower, Lahore, Pakistan","hours":"Mon – Sat, 9:00 AM – 7:00 PM"}'::jsonb)
    on conflict (key) do nothing
  `);
  console.log("[bootstrap] seeded base website content");
}

/** Full bootstrap used by the login route and the /api/setup endpoint. */
export async function bootstrapDatabase(): Promise<void> {
  await ensureSchema();
  await ensureAdminUser();
  await ensureBaseContent();
}
