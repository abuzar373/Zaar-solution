# Abuzar Software Solutions

> **🚀 Deploying? Start here → [START.md](./START.md)** — 5 minutes, copy-paste only.


A complete, production-ready fullstack web application for a premium software house — public marketing website **plus** a full admin dashboard with authentication, image uploads and CRUD for every resource.

Built with **Next.js 16 (App Router)**, **PostgreSQL**, **Drizzle ORM** and **Tailwind CSS 4**.

---

## ⚡ Quick Start

```bash
git clone https://github.com/YOUR-USERNAME/abuzar-software-solutions.git
cd abuzar-software-solutions

npm install
docker compose up -d     # starts PostgreSQL (or use your own)
cp .env.example .env     # then set AUTH_SECRET

npm run setup            # creates all tables + demo data + admin user
npm run dev              # → http://localhost:3000
```

**Admin login:** `admin@abuzarsoftware.com` / `admin123` → [http://localhost:3000/admin](http://localhost:3000/admin)

📖 **Local setup, GitHub and deployment → [SETUP.md](./SETUP.md)**
☁️ **Deploy with a free Supabase database → [SUPABASE.md](./SUPABASE.md)**

### Verify any deployment

```
GET /api/health?full=1
```

Reports database connectivity, provider, missing tables and row counts.

---

## ✨ Features

### Public Website
- **Home** — animated hero, live statistics, services preview, featured & recent projects, testimonials, CTA
- **About** — company intro, mission, vision, process steps and team (all editable from the admin panel)
- **Services** — dynamic services with icons, descriptions and images
- **Portfolio** — category filtering, live search, pagination, GitHub / live-demo links
- **Contact** — validated form saved to the database
- **Get Quote** — full project quote request form
- Dark / light mode, glassmorphism, animated gradients, fully responsive, SEO metadata, custom 404

### Admin Dashboard (`/admin`)
- Secure login — **bcrypt** hashing + **HMAC-signed HTTP-only cookies**
- Server-side route protection via Next.js **middleware**
- Dashboard with stat cards, monthly bar charts and notification banners
- Full **CRUD** for Projects, Services and Testimonials
- **Inbox management** for contact & quote requests (statuses, search, filters, pagination)
- **Website content manager** — hero, statistics, about, process steps, team members
- **Image uploads** with live preview
- Toast notifications, optimistic updates, loading spinners, empty states

---

## 🛠 Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 (App Router, Server Components, Route Handlers) |
| Database | PostgreSQL |
| ORM | Drizzle ORM + drizzle-kit |
| Styling | Tailwind CSS 4 |
| Auth | bcryptjs + HMAC-SHA256 signed session cookies |
| Security | Middleware route guards, input validation, rate limiting, path-traversal-safe uploads |

---

## 🔌 REST API

| Method | Endpoint | Auth | Description |
| ------ | -------- | :--: | ----------- |
| `POST` | `/api/auth/login` | — | Admin login (rate limited) |
| `POST` | `/api/auth/logout` | — | Clear session |
| `GET` | `/api/auth/me` | ✅ | Current admin user |
| `GET` | `/api/projects` | — | List — `q`, `category`, `featured`, `page`, `limit`, `sort` |
| `POST` | `/api/projects` | ✅ | Create project |
| `GET` `PUT` `DELETE` | `/api/projects/:id` | ✅ writes | Manage a project |
| `GET` `POST` | `/api/services` · `/:id` | ✅ writes | Services CRUD |
| `GET` `POST` | `/api/testimonials` · `/:id` | ✅ writes | Testimonials CRUD |
| `POST` | `/api/contacts` | — | Submit contact form (validated + rate limited) |
| `GET` `PUT` `DELETE` | `/api/contacts` · `/:id` | ✅ | Manage submissions |
| `POST` | `/api/quotes` | — | Submit quote request |
| `GET` `PUT` `DELETE` | `/api/quotes` · `/:id` | ✅ | Manage quote requests |
| `GET` `PUT` | `/api/settings` | ✅ write | Website content |
| `GET` | `/api/stats` | ✅ | Dashboard statistics & charts |
| `POST` | `/api/upload` | ✅ | Upload an image (5 MB max) |
| `GET` | `/api/uploads/:name` | — | Serve an uploaded image |
| `GET` | `/api/health` | — | Health check |

---

## 🗄 Database Tables

`users` · `projects` · `services` · `testimonials` · `contacts` · `quotes` · `settings`

Schema lives in [`src/db/schema.ts`](./src/db/schema.ts). Apply changes with `npx drizzle-kit push`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (site)/       # Public pages
│   ├── admin/        # Admin dashboard
│   ├── api/          # REST API routes
│   └── not-found.tsx # 404
├── components/       # Navbar, Footer, admin UI kit
├── db/               # Drizzle schema + client
├── lib/              # Auth + content helpers
└── middleware.ts     # /admin route guard
```

---

## 🚀 Deployment

Deploys to **Vercel**, **Render**, **Railway**, **Fly.io** or any Node host. Set `DATABASE_URL` and `AUTH_SECRET` as environment variables, then seed the remote database.

See [SETUP.md § Deploy](./SETUP.md#8-deploy-to-vercel) for the full walkthrough.

---

## 📄 License

MIT — free to use for personal and commercial projects.
