# 🚀 Abuzar Software Solutions

A COMPLETE, production-ready Full Stack web application for a modern software house — built with **Next.js (App Router)**, **PostgreSQL**, **Drizzle ORM**, and **Tailwind CSS**.

---

## 📋 Table of Contents
1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Prerequisites](#-prerequisites)
4. [How to Run Locally](#-how-to-run-locally)
5. [How to Push to GitHub](#-how-to-push-to-github)
6. [Admin Credentials](#-admin-credentials)
7. [API Endpoints](#-api-endpoints)
8. [Database Schema](#-database-schema)
9. [Deployment](#-deployment)

---

## ✨ Features

### 🌐 Main Website
- **Home** — Animated hero, statistics counter, services preview, featured projects, recent projects, client testimonials, and CTA.
- **About** — Company intro, mission, vision, 4-step process, and team members.
- **Services** — Dynamic services with icons, descriptions, and images.
- **Portfolio** — Category filtering, live search, pagination, GitHub links, and live demo links.
- **Contact & Get Quote** — Form validation, persistent storage in PostgreSQL, rate limiting, and instant feedback.
- **Dark / Light Mode** — Built-in theme switcher with glassmorphism design.

### 🔐 Admin Panel (`/admin`)
- **Authentication:** Protected admin panel using signed HTTP-only cookies and bcrypt password hashing.
- **Dashboard:** Stats overview, notifications for new contacts/quotes, and interactive monthly charts.
- **Portfolio CRUD:** Add, Edit, Delete, Toggle Featured status, and upload project images.
- **Services & Testimonials CRUD:** Full control over services and client reviews.
- **Contact & Quote Requests:** Inbox management with status workflows (New, Read, Replied, Pending, Accepted, Declined).
- **Website Content Manager:** Live update Hero content, Statistics, About section, Process steps, and Team members.
- **Uploads:** Image uploader with live preview saved directly to `/uploads`.

---

## 🛠️ Tech Stack

- **Frontend & Backend:** Next.js 15 (App Router, Route Handlers)
- **Database:** PostgreSQL + Drizzle ORM
- **Styling:** Tailwind CSS 4 (Glassmorphism & Dark Mode)
- **Authentication:** Bcryptjs + HMAC-signed HTTP-only session cookies
- **File Uploads:** Native Node.js stream upload saved to `uploads/` directory
- **Validation & Security:** Rate limiting, strict route protection, and sanitization

---

## ⚙️ Prerequisites

Before running locally, ensure you have installed:
- **Node.js** (v18.x or v20.x recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** (installed locally, running in Docker, or hosted on Supabase / Neon / Render)

---

## 💻 How to Run Locally

### Step 1: Clone or extract the project
```bash
git clone https://github.com/YOUR_USERNAME/abuzar-software-solutions.git
cd abuzar-software-solutions
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Set up environment variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection URL and auth secret:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/abuzar_db
AUTH_SECRET=your-secret-key-change-this-in-production
```

> **Tip:** If using local PostgreSQL, create the database first:
> ```bash
> psql -U postgres -c "CREATE DATABASE abuzar_db;"
> ```

### Step 4: Push database schema & seed demo data
Push tables to PostgreSQL:
```bash
npx drizzle-kit push
```

Seed initial demo data (Admin user, projects, services, testimonials, contacts, quotes, website settings):
```bash
psql postgresql://postgres:postgres@localhost:5432/abuzar_db -f scripts/seed.sql
```

### Step 5: Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

---

## 📤 How to Push to GitHub

Follow these step-by-step commands to push this project to your GitHub repository:

### Step 1: Initialize Git (if not already initialized)
```bash
git init
```

### Step 2: Add files and make your first commit
```bash
git add .
git commit -m "feat: complete production-ready Abuzar Software Solutions fullstack web application"
```

### Step 3: Create a new repository on GitHub
1. Go to [GitHub.com](https://github.com) and click **"New Repository"**.
2. Name it `abuzar-software-solutions` (or any name you prefer).
3. Do **NOT** check "Initialize this repository with a README" (since we already have one).
4. Click **"Create repository"**.

### Step 4: Link your local repository and push
Copy the commands provided by GitHub (replace `YOUR_USERNAME` with your GitHub username):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/abuzar-software-solutions.git
git push -u origin main
```

---

## 🔑 Admin Credentials

- **Admin Login Page:** `/login` or `/admin`
- **Email:** `admin@abuzarsoftware.com`
- **Password:** `admin123`

---

## 🔌 API Endpoints

| Method | Endpoint | Auth Required | Description |
| ------ | -------- | ------------- | ----------- |
| `POST` | `/api/auth/login` | No | Admin authentication |
| `POST` | `/api/auth/logout` | No | Admin sign out |
| `GET`  | `/api/auth/me` | Yes | Verify admin session |
| `GET`  | `/api/projects` | No | Fetch projects (supports filter, search, pagination) |
| `POST` | `/api/projects` | Yes | Create project |
| `PUT`  | `/api/projects/:id` | Yes | Update project |
| `DELETE` | `/api/projects/:id` | Yes | Delete project |
| `GET`  | `/api/services` | No | Fetch services |
| `POST/PUT/DELETE` | `/api/services/:id` | Yes | Manage services |
| `GET`  | `/api/testimonials` | No | Fetch testimonials |
| `POST/PUT/DELETE` | `/api/testimonials/:id` | Yes | Manage testimonials |
| `POST` | `/api/contacts` | No | Submit contact form |
| `GET/PUT/DELETE` | `/api/contacts/:id` | Yes | Manage contact submissions |
| `POST` | `/api/quotes` | No | Submit quote request |
| `GET/PUT/DELETE` | `/api/quotes/:id` | Yes | Manage quote requests |
| `GET`  | `/api/settings` | No | Fetch website content |
| `PUT`  | `/api/settings` | Yes | Update website content |
| `GET`  | `/api/stats` | Yes | Fetch dashboard analytics |
| `POST` | `/api/upload` | Yes | Upload image file |
| `GET`  | `/api/uploads/:name` | No | Serve uploaded image |

---

## 🌐 Deployment with Supabase + Vercel

The application uses **Drizzle ORM for every database interaction** and Supabase as the hosted PostgreSQL provider. It also uses Supabase Storage for persistent production image uploads.

### 1. Create the Supabase project
1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → Database → Connection string**.
3. Select **Transaction pooler** and copy the URI. For Vercel/serverless, use port `6543` and keep `?pgbouncer=true`.
4. Open **Project Settings → API** and copy:
   - Project URL
   - `service_role` key (backend only — never expose it in a `NEXT_PUBLIC_*` variable)

### 2. Configure local environment
Copy the template:

```bash
cp .env.example .env
```

Set these values in `.env`:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:DB_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
AUTH_SECRET=use-a-long-random-secret
ADMIN_NAME=Abuzar Ahmed
ADMIN_EMAIL=admin@abuzarsoftware.com
ADMIN_PASSWORD=use-a-strong-admin-password
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=uploads
```

### 3. Create tables and seed the admin account
Run from the project root:

```bash
npx drizzle-kit push
psql "$DATABASE_URL" -f scripts/seed.sql
```

The seed creates the demo admin:

- Email: `admin@abuzarsoftware.com`
- Password: `admin123`

If you do not run the seed, the first login using `ADMIN_EMAIL` and `ADMIN_PASSWORD` automatically provisions the admin user after the `users` table exists.

### 4. Configure Vercel
In **Vercel → Project → Settings → Environment Variables**, add these variables for **Production, Preview, and Development**:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

Then redeploy from the `main` branch. After the first deployment, log in at `/login` with the configured admin credentials. If the tables exist, the admin account is created automatically on that first login.

After deployment, open:

```text
https://YOUR-VERCEL-DOMAIN.vercel.app/api/health
```

A healthy response contains `"ok":true`, `"database":"connected"`, and `"supabaseStorageConfigured":true`.

### 5. Persistent image uploads
Admin uploads use Supabase Storage when the Supabase URL and service-role key are configured. The `uploads` bucket is created automatically on the first upload as a public bucket. Local development still falls back to the local `uploads/` folder.

### Important
- Do not commit `.env` or any Supabase service-role key.
- Do not use the Supabase service-role key in frontend code.
- If the quote/contact form says the server returned an empty response, check `/api/health` and confirm `DATABASE_URL` is configured in Vercel for the active environment.


---

## 📄 License
MIT © Abuzar Software Solutions
