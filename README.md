# LateCheckout x LittlePreneurs — VIP Entry System

A Next.js app for managing VIP guest entry at events. Families self-register with a public form — up to 2 adults and 3 kids per registration — and get a unique QR code on screen. Admins can also add registrations individually or via bulk CSV/Excel upload, and search, edit, or delete any registration. Staff scan QR codes at the door to check families in — each code can be redeemed exactly once.

Every page except `/register` requires admin login.

---

## How It Works

### 1. Public Registration (`/register`)
Anyone can visit `/register` — no login required. It's the only public page. Guests enter 1–2 adults, 1–3 kids (name + age each), and a phone number, then submit. Phone number must be unique; re-registering with a number that's already on file is rejected. Trying to add a 4th kid shows a note to contact the admin instead. On success, a QR code (encoding the entry's UUID) is shown on screen to save, screenshot, or print.

### 2. Admin Login
Every other page is protected by a passcode stored in `ADMIN_SECRET`. Visiting any admin page without a valid session redirects to `/login`. The session is stored in an httpOnly cookie and lasts 7 days; `Logout` clears it.

### 3. Admin Onboarding (`/onboard`)
Two modes are available for staff adding registrations on a family's behalf:

**Individual** — same form as public registration (adults, kids, phone number).

**Bulk Upload** — drag and drop (or browse) a `.xlsx`, `.xls`, or `.csv` file. Required columns: `adult1_name`, `kid1_name`, `kid1_age`, `number`. Optional: `adult2_name`, `kid2_name`/`kid2_age`, `kid3_name`/`kid3_age`. Each valid row is submitted sequentially. Rows with errors (including duplicate phone numbers) are reported in the UI.

### 4. Door Verification (`/verify`)
Staff log in, then open `/verify`. The page activates the camera and scans QR codes. On a successful scan:
- The family's details are fetched from the database
- Their check-in status is shown
- Staff tap to mark them as checked in (`checkedin = true`)

Check-in is atomic — if the same code is scanned twice at once, only the first request succeeds; the second is told the family is already checked in.

### 5. Admin Search (`/admin`)
Staff log in, then open `/admin` to look up a registration by name or phone number (substring match). Selecting a result from the list opens an editable record — adults, kids, phone number, and checked-in status can all be changed, or the registration can be deleted. The record's QR code is shown alongside for reprinting.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL) — `adults` and `kids` are stored as JSONB arrays
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

# Admin passcode for every page except /register
ADMIN_SECRET=your_strong_passcode
```

---

## Database Setup

Run the migrations against your Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

This creates the `public.entries` table with columns: `id`, `adults` (jsonb, e.g. `[{"name": "Jane"}]`), `kids` (jsonb, e.g. `[{"name": "Sam", "age": 7}]`), `number`, `checkedin`, `created_at`, plus legacy `name`/`child_name`/`age`/`email` columns kept (but unused) for older rows, a unique index on `number`, and RLS policies allowing anon read/write.

If upgrading a database that already has duplicate phone numbers, the unique-index migration will fail — deduplicate first (see migration comments).

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on `/register`, the only public page. Every other page (`/onboard`, `/verify`, `/admin`) redirects to `/login` — enter the value you set for `ADMIN_SECRET`.

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
  layout.tsx          # Shell — SiteChrome renders the header everywhere but /register
  page.tsx            # Redirects / → /register
  register/page.tsx   # Public self-registration form (only unauthenticated page)
  login/page.tsx      # Passcode login form
  onboard/page.tsx    # Admin individual + bulk upload tabs
  verify/page.tsx     # QR scanner for door staff
  admin/page.tsx      # Search, edit, delete registrations
  api/
    auth/route.ts     # POST (login) / DELETE (logout) — public
    entries/
      route.ts        # GET (list/search, admin) / POST (create, public)
      [id]/route.ts   # GET / PATCH (check-in once, or admin edit) / DELETE — admin

components/
  EntryForm.tsx        # Dynamic adults (max 2) / kids (max 3) / phone form
  ExcelUpload.tsx       # Drag-and-drop bulk upload
  QRCodeDisplay.tsx     # QR code card shown after entry creation
  QRScanner.tsx         # Camera-based QR scanner
  AdminSearch.tsx       # Search results + edit/delete panel for /admin
  SiteChrome.tsx        # Header/nav, hidden on /register
  LogoutButton.tsx      # Clears session cookie

utils/
  validate-entry.ts    # Shared adults/kids validation (create + edit)
  supabase/             # Supabase client helpers (browser, server, proxy)

proxy.ts                 # Admin-gates every route except /register, /login, /api/auth, POST /api/entries
supabase/migrations/      # SQL migration files
scripts/
  setup_entries.sql      # Standalone SQL if not using CLI migrations
  test-entries.mjs       # Node script to verify DB connection and CRUD
```
