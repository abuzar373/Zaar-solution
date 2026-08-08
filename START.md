# 🚀 5-Minute Setup (Supabase + Vercel)

The code is complete and already pushed to GitHub. Your Vercel site auto-deploys
from this repo. Only TWO values are needed, both pasted in **your own accounts**
(database host + hosting dashboard) — nobody else can do this part for you.

---

## Step 1 — Create the free database (2 min)

1. Go to **https://supabase.com** → **Start your project** (Sign in with GitHub is fine)
2. Click **New project**
3. Fill in:
   - Name: `zaar-solution`
   - Database password: **choose your own, save it somewhere** (you'll need it in step 2)
   - Region: pick the closest one (e.g. Mumbai / Singapore / Frankfurt)
4. Click **Create new project** and wait ~2 minutes until it says "Active"

## Step 2 — Copy the connection string

1. In Supabase click **Connect** (top menu)
2. Choose **Transaction pooler** (port **6543**)
3. Copy the `postgresql://…` string
4. In that string replace `[YOUR-PASSWORD]` with the password you chose in step 1

## Step 3 — Paste into Vercel (1 min)

1. Go to **https://vercel.com** → open this project
2. **Settings → Environment Variables**
3. Add these two (tick Production + Preview + Development):

| Name | Value |
| ---- | ----- |
| `DATABASE_URL` | the string from step 2 (the `6543` one) |
| `AUTH_SECRET` | `1E5LfcORMWkkvEyeQOB52h4jW9LO23mDNTI44/RDirM=` |

4. ⚠️ If `ADMIN_EMAIL`, `ADMIN_NAME` or `ADMIN_PASSWORD` exist and are **empty** → **delete them**.

## Step 4 — Redeploy

**Deployments → latest deployment → ⋯ → Redeploy**

## Step 5 — Done ✅

- Open `https://YOUR-SITE.vercel.app/setup` → everything should show ✓
- Open `https://YOUR-SITE.vercel.app/login`
- Sign in: `admin@abuzarsoftware.com` / `admin123`
- Change the password under **My Profile**

Everything else (tables, admin account, demo content) is created automatically
the first time someone logs in or submits a form.

---

### Something shows ✕ on /setup?

| What it says | What to do |
| ------------ | ---------- |
| Database connection ✕ | `DATABASE_URL` is wrong. Re-copy it from Supabase → Connect → **Transaction pooler**, make sure the password is correct, redeploy. |
| AUTH_SECRET ✕ | You skipped it in step 3. Login still works, but add it anyway. |
