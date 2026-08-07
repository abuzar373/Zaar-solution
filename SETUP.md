# Setup Guide — Abuzar Software Solutions

Everything you need to run this project on your own machine and push it to GitHub.

---

## 1. Prerequisites

| Tool | Version | Check with |
| ---- | ------- | ---------- |
| **Node.js** | 20 or newer | `node -v` |
| **npm** | 10 or newer | `npm -v` |
| **PostgreSQL** | 14 or newer | `psql --version` |
| **Git** | any | `git --version` |

> No Postgres installed? Use Docker instead — see step 3, Option A. It's one command.

---

## 2. Get the code

**If you downloaded the project as a ZIP:** unzip it and `cd` into the folder.

**If it's already on GitHub:**
```bash
git clone https://github.com/YOUR-USERNAME/abuzar-software-solutions.git
cd abuzar-software-solutions
```

Then install dependencies:
```bash
npm install
```

---

## 3. Start PostgreSQL

### Option A — Docker (easiest, recommended)

```bash
docker compose up -d
```

That's it. This starts Postgres on port `5432` with user `postgres`, password `postgres`, database `app_db` — exactly matching the default `DATABASE_URL`.

Check it's healthy:
```bash
docker compose ps
```

### Option B — Postgres installed locally

Create the database:
```bash
createdb app_db
```
Or from inside `psql`:
```sql
CREATE DATABASE app_db;
```

If your username/password differ from `postgres:postgres`, update `DATABASE_URL` in step 4.

### Option C — Free cloud database (Neon / Supabase)

1. Create a free project at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com)
2. Copy the connection string
3. Paste it as `DATABASE_URL` in step 4 (keep the `?sslmode=require` suffix)

---

## 4. Configure environment variables

```bash
cp .env.example .env
```
On Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Open `.env` and set at minimum:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
AUTH_SECRET=paste-a-long-random-string-here
```

Generate a strong `AUTH_SECRET`:
```bash
openssl rand -base64 32
```
No OpenSSL (Windows)?
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> ⚠️ `.env` is git-ignored on purpose — never commit real secrets.

---

## 5. Create the tables and load demo data

```bash
npx drizzle-kit push     # creates all 7 tables from src/db/schema.ts
node scripts/seed.mjs    # loads demo projects, services, testimonials + admin user
```

You should see:

```
✓ Database seeded successfully!

  users: 1
  projects: 8
  services: 9
  testimonials: 5
  contacts: 6
  quotes: 5
  settings: 4
```

The seeder is **idempotent** — safe to run as many times as you like.

Want a different admin password? Set it in `.env` before seeding:
```env
ADMIN_EMAIL=you@yourdomain.com
ADMIN_PASSWORD=your-secure-password
```

---

## 6. Run the app

```bash
npm run dev
```

Open **http://localhost:3000**

| URL | What it is |
| --- | ---------- |
| `/` | Public website |
| `/login` | Admin login |
| `/admin` | Admin dashboard |

**Admin credentials:** `admin@abuzarsoftware.com` / `admin123`

### Production build (locally)
```bash
npm run build
npm run start
```

---

## 7. Push to GitHub

### First, sanity-check that no secrets will be committed

```bash
git init
git add .
git status
```

✅ You should **NOT** see `.env`, `node_modules/`, or `.next/` in the list.
✅ You **should** see `.env.example`, `src/`, `scripts/`, `README.md`.

If `.env` appears, stop and confirm `.gitignore` exists in the project root.

### Create the commit

```bash
git commit -m "Abuzar Software Solutions — full stack software house website"
git branch -M main
```

### Create the repo on GitHub

**Option A — GitHub CLI** (installs from [cli.github.com](https://cli.github.com)):
```bash
gh repo create abuzar-software-solutions --public --source=. --push
```

**Option B — Manually**

1. Go to [github.com/new](https://github.com/new)
2. Name it `abuzar-software-solutions`
3. **Do not** tick "Add a README" / "Add .gitignore" (you already have them)
4. Click **Create repository**, then run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/abuzar-software-solutions.git
git push -u origin main
```

### Pushing later changes
```bash
git add .
git commit -m "Describe what you changed"
git push
```

---

## 8. Deploy to Vercel

> ⚠️ **You must create a cloud database first.** Vercel cannot reach a database
> running on your laptop. Create a free Postgres at
> [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) and copy
> its connection string (it ends with `?sslmode=require`).

1. Push to GitHub (step 7)
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Under **Environment Variables**, add both of these **before** deploying:

   | Name | Value |
   | ---- | ----- |
   | `DATABASE_URL` | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
   | `AUTH_SECRET` | a long random string (`openssl rand -base64 32`) |

   Apply them to **Production, Preview and Development**.
4. Click **Deploy**

### After the first deploy — create the tables

The build succeeds without a database, but the site has no data until you push
the schema. Run this **from your own machine**, pointing at the cloud database:

```bash
# macOS / Linux
DATABASE_URL="your-cloud-url" npx drizzle-kit push
DATABASE_URL="your-cloud-url" node scripts/seed.mjs
```

```powershell
# Windows PowerShell
$env:DATABASE_URL="your-cloud-url"; npx drizzle-kit push
$env:DATABASE_URL="your-cloud-url"; node scripts/seed.mjs
```

Then visit `https://your-app.vercel.app/login`.

### Vercel troubleshooting

| Symptom | Cause & fix |
| ------- | ----------- |
| Build fails: `ECONNREFUSED 127.0.0.1:5432` | `DATABASE_URL` was not set. Add it in Project → Settings → Environment Variables, then **Redeploy**. |
| Site loads but shows empty states everywhere | Tables/data missing — run the two commands above. |
| Login says "Invalid email or password" | The seed step never ran against the cloud database. |
| Uploaded images disappear | Vercel's filesystem is read-only and ephemeral — see the note below. |

After the first deploy, seed the cloud database from your own machine:
```bash
DATABASE_URL="your-cloud-url" npx drizzle-kit push
DATABASE_URL="your-cloud-url" node scripts/seed.mjs
```

> **Note on image uploads:** Vercel's filesystem is read-only and ephemeral, so files written to `uploads/` won't survive on Vercel. The admin image fields also accept a **direct image URL**, which works everywhere. For persistent uploads on Vercel, switch `src/app/api/upload/route.ts` to Vercel Blob, S3, or Cloudinary. Uploads work perfectly on **local**, **Render**, **Railway**, **Fly.io**, or any VPS/Docker host.

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `ECONNREFUSED 127.0.0.1:5432` | Postgres isn't running → `docker compose up -d` |
| `password authentication failed` | Wrong credentials in `DATABASE_URL` |
| `Tables not found. Run npx drizzle-kit push` | You skipped step 5 |
| `DATABASE_URL is required` | `.env` is missing → `cp .env.example .env` |
| Login says "Invalid email or password" | Re-run `node scripts/seed.mjs` to reset the admin password |
| Login says "Cannot reach the database" | Postgres isn't running → `docker compose up -d` |
| Login says "Database tables are missing" | Run `npx drizzle-kit push`, then `node scripts/seed.mjs` |
| Redirected to `/login` in a loop | Stale cookie — hard refresh (`Ctrl/Cmd+Shift+R`) or use a private window |
| Port 3000 already in use | `npm run dev -- -p 3001` |
| Changed `AUTH_SECRET` and got logged out | Expected — old cookies are invalidated. Just log in again. |

---

## Project structure

```
├── src/
│   ├── app/
│   │   ├── (site)/          # Public website (home, about, services, portfolio, contact, quote, login)
│   │   ├── admin/           # Admin dashboard + sidebar layout
│   │   ├── api/             # REST API route handlers
│   │   ├── layout.tsx       # Root layout + theme script
│   │   ├── globals.css      # Tailwind + animations
│   │   └── not-found.tsx    # 404 page
│   ├── components/          # Navbar, Footer, admin UI kit, Inbox
│   ├── db/                  # Drizzle schema + connection
│   ├── lib/                 # Auth helpers, site content helpers
│   └── middleware.ts        # Server-side /admin route guard
├── scripts/
│   ├── seed.sql             # Demo data
│   └── seed.mjs             # Cross-platform seeder (run this)
├── uploads/                 # Uploaded images (git-ignored)
├── docker-compose.yml       # Local Postgres
├── drizzle.config.ts        # Reads DATABASE_URL from .env
└── .env.example             # Copy to .env
```

## Useful commands

```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Run the production build
npm run lint             # ESLint
npm run typecheck        # TypeScript check
npx drizzle-kit push     # Apply schema changes to the database
npx drizzle-kit studio   # Visual database browser
node scripts/seed.mjs    # Re-seed demo data
docker compose up -d     # Start Postgres
docker compose down -v   # Stop Postgres and delete its data
```
