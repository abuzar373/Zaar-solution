-- =====================================================================
--  Abuzar Software Solutions — Supabase one-shot setup
--
--  Supabase dashboard → SQL Editor → New query → paste this whole file
--  → press RUN (or Ctrl+Enter). Done.
--
--  Safe to run multiple times (everything is IF NOT EXISTS / ON CONFLICT).
-- =====================================================================

-- 1) TABLES ------------------------------------------------------------
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

-- 2) ADMIN ACCOUNT (login: admin@abuzarsoftware.com / admin123) --------
insert into users (name, email, password_hash, role)
values (
  'Abuzar Ahmed',
  'admin@abuzarsoftware.com',
  '$2b$10$8IKapY/ZG8jX36KtYSQRWOusViRybUzPKxY9SDsrKN4S4V0JowyIy',
  'admin'
)
on conflict (email) do nothing;

-- 3) BASE WEBSITE CONTENT ----------------------------------------------
insert into settings (key, value) values
  ('hero', '{"heading":"Abuzar Software Solutions","subtitle":"We Build Modern Websites, Mobile Apps and Business Solutions.","badge":"Premium Software House"}'::jsonb),
  ('stats', '{"clients":120,"projects":250,"years":8,"team":24}'::jsonb),
  ('contactInfo', '{"email":"hello@abuzarsoftware.com","phone":"+92 300 1234567","address":"Suite 402, Tech Tower, Lahore, Pakistan","hours":"Mon – Sat, 9:00 AM – 7:00 PM"}'::jsonb)
on conflict (key) do nothing;

-- Done! Refresh the "Tables" page on the left — you should see 7 tables.
