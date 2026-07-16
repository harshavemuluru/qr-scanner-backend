# LateCheckout x LittlePreneurs — VIP Entry System

A Next.js app for managing VIP guest entry at events. Guests self-register with a public form and get a unique QR code on screen. Admins can also add guests individually or via bulk CSV/Excel upload. Staff scan QR codes at the door to check guests in — each code can be redeemed exactly once.

---

## How It Works

### 1. Public Registration (`/register`)
Anyone can visit `/register` — no login required. Guests fill in their name, child's name, age, and phone number, then submit. Phone number must be unique; re-registering with a number that's already on file is rejected. On success, a QR code (encoding the entry's UUID) is shown on screen to save, screenshot, or print.

### 2. Admin Login
Admin-only pages are protected by a passcode stored in `ADMIN_SECRET`. Visiting `/onboard` without a valid session redirects to `/login`. The session is stored in an httpOnly cookie and lasts 7 days.

### 3. Admin Onboarding (`/onboard`)
Two modes are available for staff adding entries on a guest's behalf:

**Individual** — same form as public registration (name, child's name, age, phone number).

**Bulk Upload** — drag and drop (or browse) a `.xlsx`, `.xls`, or `.csv` file. Required columns: `name`, `child_name`, `age`, `number`. Each valid row is submitted sequentially. Rows with errors (including duplicate phone numbers) are reported in the UI.

### 4. Door Verification (`/verify`)
Staff open `/verify` on any device (no login required). The page activates the camera and scans QR codes. On a successful scan:
- The guest's details are fetched from the database
- Their check-in status is shown
- Staff tap to mark them as checked in (`checkedin = true`)

Check-in is atomic — if the same code is scanned twice at once, only the first request succeeds; the second is told the guest is already checked in.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **QR generation**: `qrcode.react` (client-side display)
- **QR scanning**: `html5-qrcode`
- **Bulk upload parsing**: `xlsx`
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Admin passcode for /onboard access
ADMIN_SECRET=your_strong_passcode
```

---

## Database Setup

Run the migrations against your Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

This creates the `public.entries` table with columns: `id`, `name`, `child_name`, `age`, `number`, `email` (unused, kept for backwards compatibility), `checkedin`, `created_at`, a unique index on `number`, plus RLS policies allowing anon read/write.

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on `/register`, the public form. Visit `/onboard` for the admin tools (redirects to `/login` — enter the value you set for `ADMIN_SECRET`).

**Test the database connection:**
```bash
npm run test:entries
```

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from the list above in Vercel → Settings → Environment Variables
4. Deploy

The GitHub Actions workflow in `.github/workflows/supabase-migrations.yml` can auto-apply migrations on push to `main` — it is currently disabled. To enable, remove the `if: ${{ false }}` line and add these repo secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`.

---

## Project Structure

```
app/
  layout.tsx          # Shell with header nav and logout button
  page.tsx            # Redirects / → /register
  register/page.tsx   # Public self-registration form
  login/page.tsx      # Passcode login form
  onboard/page.tsx    # Admin individual + bulk upload tabs
  verify/page.tsx     # QR scanner for door staff
  api/
    auth/route.ts     # POST (login) / DELETE (logout)
    entries/
      route.ts        # GET (list, admin-only) / POST (create, public)
      [id]/route.ts   # GET (fetch one) / PATCH (mark checked in, once)

components/
  EntryForm.tsx       # Name / child's name / age / phone form
  ExcelUpload.tsx     # Drag-and-drop bulk upload
  QRCodeDisplay.tsx   # QR code card shown after entry creation
  QRScanner.tsx       # Camera-based QR scanner
  LogoutButton.tsx    # Clears session cookie

utils/
  supabase/           # Supabase client helpers (browser, server, proxy)

proxy.ts               # Gates /onboard and GET /api/entries behind admin auth
supabase/migrations/    # SQL migration files
scripts/
  setup_entries.sql    # Standalone SQL if not using CLI migrations
  test-entries.mjs     # Node script to verify DB connection and CRUD
```
