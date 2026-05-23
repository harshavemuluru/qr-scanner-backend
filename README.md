# Late Checkout x Seoulful Popup — VIP Entry System

A Next.js app for managing VIP guest entry at events. Admins onboard guests individually or via bulk CSV/Excel upload. Each guest receives a unique QR code by email. Staff scan QR codes at the door to check guests in.

---

## How It Works

### 1. Admin Login
All admin pages are protected by a passcode stored in `ADMIN_SECRET`. Visiting `/onboard` without a valid session redirects to `/login`. The session is stored in an httpOnly cookie and lasts 7 days.

### 2. Onboarding Guests (`/onboard`)
Two modes are available:

**Individual** — fill in name, email, and phone number, then submit. The entry is saved to Supabase and a QR pass email is sent to the guest immediately.

**Bulk Upload** — drag and drop (or browse) a `.xlsx`, `.xls`, or `.csv` file. Required columns: `name`, `email`, `number`. Each valid row is submitted sequentially; a QR pass email is sent for every successfully inserted row. Rows with errors are reported in the UI.

A sample CSV is available at `/sample_upload.csv`.

### 3. QR Pass Email
After a guest is saved to the database, an email is sent containing:
- Their name, email, and phone number
- A unique QR code image (embedded inline, not as an attachment)
- Event contact number: 9542760910

Email is sent via Gmail SMTP by default (`EMAIL_PROVIDER=gmail`). Can be switched to Resend by setting `EMAIL_PROVIDER=resend`.

### 4. Door Verification (`/verify`)
Staff open `/verify` on any device (no login required). The page activates the camera and scans QR codes. On a successful scan:
- The guest's details are fetched from the database
- Their check-in status is shown
- Staff tap to mark them as checked in (`checkedin = true`)

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Email**: Nodemailer + Gmail SMTP (or Resend)
- **QR generation**: `qrcode` (server-side), `qrcode.react` (client-side display)
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

# Email provider: "gmail" (default) or "resend"
EMAIL_PROVIDER=gmail

# Gmail SMTP (used when EMAIL_PROVIDER=gmail)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# Resend (used when EMAIL_PROVIDER=resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM=Your Name <you@yourdomain.com>
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail".

---

## Database Setup

Run the migration against your Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

This creates the `public.entries` table with columns: `id`, `name`, `email`, `number`, `checkedin`, `created_at`, plus RLS policies allowing anon read/write.

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` — enter the value you set for `ADMIN_SECRET`.

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
  page.tsx            # Redirects / → /onboard
  login/page.tsx      # Passcode login form
  onboard/page.tsx    # Individual + bulk upload tabs
  verify/page.tsx     # QR scanner for door staff
  api/
    auth/route.ts     # POST (login) / DELETE (logout)
    entries/
      route.ts        # GET (list) / POST (create + send email)
      [id]/route.ts   # GET (fetch one) / PATCH (mark checked in)

components/
  EntryForm.tsx       # Individual entry form
  ExcelUpload.tsx     # Drag-and-drop bulk upload
  QRCodeDisplay.tsx   # QR code card shown after entry creation
  QRScanner.tsx       # Camera-based QR scanner
  LogoutButton.tsx    # Clears session cookie

utils/
  send-qr-email.ts    # Builds and sends QR pass email (Gmail or Resend)
  supabase/           # Supabase client helpers (browser, server, middleware)

middleware.ts         # Protects /onboard and POST /api/entries
supabase/migrations/  # SQL migration files
scripts/
  setup_entries.sql   # Standalone SQL if not using CLI migrations
  test-entries.mjs    # Node script to verify DB connection and CRUD
```

