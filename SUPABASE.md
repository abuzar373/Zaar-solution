# Connect to Supabase

Point the app at a free Supabase Postgres database so the frontend, backend and
admin panel all work on Vercel.

---

## 1. Create the database

1. Sign in at [supabase.com](https://supabase.com) → **New project**
2. Name it `abuzar-software`, choose a region near your users
3. Set a **database password** and save it somewhere safe — you need it next
4. Wait ~2 minutes for provisioning

---

## 2. Copy the two connection strings

In your project go to **Connect** (top bar) → **ORMs** / **Connection string**.

Supabase gives you several URLs. You need **two different ones**:

| Use it for | Which one | Port |
| ---------- | --------- | ---- |
| Creating tables & seeding (from your PC) | **Session pooler** *(or Direct connection)* | `5432` |
| Running the app on Vercel | **Transaction pooler** | `6543` |

> **Why two?** Serverless functions open many short-lived connections, so Vercel
> needs the transaction pooler (`6543`). But schema migrations need a full
> session, which only `5432` supports.

Replace `[YOUR-PASSWORD]` in both strings with your real password.
If the password contains `@ : / ?` or `#`, [URL-encode it](https://www.urlencoder.io/)
(for example `p@ss` → `p%40ss`).

---

## 3. Create the tables and demo data

Run this **once from your own computer**, using the **5432** URL:

```bash
npm run setup "postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"
```

```powershell
# Windows PowerShell — same command, quotes required
npm run setup "postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"
```

Expected output:

```
  1/3 Connecting… ok
  2/3 Creating tables… ok
  3/3 Seeding demo data… ok

  Done!

  users: 1
  projects: 8
  services: 9
  testimonials: 5
  contacts: 6
  quotes: 5
  settings: 6
```

Verify in Supabase → **Table Editor** — you should see all 7 tables.

---

## 4. Add the environment variables on Vercel

**Vercel → your project → Settings → Environment Variables.**
Add both, ticked for **Production, Preview and Development**:

| Name | Value |
| ---- | ----- |
| `DATABASE_URL` | the **6543** transaction pooler URL |
| `AUTH_SECRET` | a long random string |

Generate the secret:

```bash
openssl rand -base64 32
```
```bash
# no OpenSSL (Windows)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then **Deployments → ⋯ → Redeploy**.

> Environment variables are only read at build/boot time — you must redeploy
> after adding them.

---

## 5. Verify the deployment

Open this URL in your browser:

```
https://your-app.vercel.app/api/health?full=1
```

A healthy deployment returns:

```json
{
  "ok": true,
  "database": { "connected": true, "ssl": true, "provider": "Supabase" },
  "schema": { "ready": true, "missingTables": [] },
  "counts": { "users": 1, "projects": 8, "services": 9, "testimonials": 5,
              "contacts": 6, "quotes": 5, "settings": 6 },
  "authSecretSet": true
}
```

Then sign in at `https://your-app.vercel.app/login` with
`admin@abuzarsoftware.com` / `admin123` — and **change the password immediately**
under **My Profile**.

---

## Local development against Supabase

Put the **5432** URL in your local `.env`:

```env
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres
AUTH_SECRET=any-long-random-string
```

```bash
npm run dev
```

---

## Troubleshooting

| Symptom | Cause & fix |
| ------- | ----------- |
| `"Cannot reach the database…"` in the UI | `DATABASE_URL` missing or wrong on Vercel. Check `/api/health?full=1`, fix, **redeploy**. |
| `"The database tables have not been created yet"` | Step 3 was skipped, or you ran it against a different project. |
| `password authentication failed` | Wrong password, or special characters not URL-encoded. |
| `Tenant or user not found` | The pooler username must be `postgres.<project-ref>`, not plain `postgres`. Re-copy from the Connect dialog. |
| `ENETUNREACH` / IPv6 error | You used the *Direct connection*. Use the **pooler** URL instead. |
| `prepared statement "s0" already exists` | You used the `6543` URL for migrations. Use `5432` for `setup-db.mjs`. |
| `remaining connection slots are reserved` | Use the transaction pooler (`6543`) on Vercel, not `5432`. |
| Login says *Invalid email or password* | Seeding never ran against this database — re-run step 3. |
| Uploaded images vanish | Vercel's filesystem is read-only. Paste an image **URL** instead, or use Supabase Storage. |

---

## Optional: Supabase Storage for image uploads

Vercel cannot write files to disk, so the built-in uploader is disabled there
(it returns a clear message telling you to paste a URL). For persistent uploads:

1. Supabase → **Storage** → create a **public** bucket named `uploads`
2. Upload images through the Supabase dashboard
3. Copy each public URL and paste it into the image field in the admin panel

The image fields accept any direct URL, so this works immediately with no code
changes.
