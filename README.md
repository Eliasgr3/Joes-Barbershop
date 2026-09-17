# Joe's Barbershop

Public booking site + owner admin dashboard for Joe's Barbershop (Χολαργός, Athens). Replaces the
old static placeholder site — customers now book online (barber → service → time → confirm, pay in
person), and the owner manages everything from `/admin`.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS 4 + Supabase (Postgres + Auth) + Resend (email).

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com/dashboard](https://supabase.com/dashboard) (free
   tier is enough). In the SQL Editor, run the three migration files in order:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
   - `supabase/migrations/0003_seed_data.sql` (seeds the current barber + the real 12-item price list)

3. **Create the one admin login.** In Supabase → Authentication → Users → Add user, create an
   email/password account for the shop owner. There's no self-serve sign-up page by design — only
   this one account can reach `/admin`.

4. **Copy `.env.example` to `.env.local`** and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — from
     Supabase → Project Settings → API.
   - `RESEND_API_KEY` — from [resend.com](https://resend.com) (free tier), for booking confirmation
     emails. Without this, bookings still work — emails are just skipped.

5. **Run it**
   ```bash
   npm run dev
   ```

## What works without Supabase configured

The public site and the booking wizard's UI/availability logic run against built-in demo data even
with no `.env.local` — useful for reviewing the design before wiring up the database. Actually
submitting a booking, and the entire `/admin` dashboard, need Supabase configured to do anything real.

## Project structure

- `src/app/` — public site (`/`), booking flow (`/book`), admin dashboard (`/admin`)
- `src/lib/availability.ts` — the slot-computation engine (pure function, unit-testable)
- `src/lib/admin-actions.ts` — Server Actions backing every admin CRUD form
- `supabase/migrations/` — schema, RLS policies, seed data
