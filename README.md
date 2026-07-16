# Diagnostic Test

A mobile-first diagnostic "Readiness Scorecard" for GMAT, GRE, and SAT prep,
built for **IMS Venturi (Vadodara Franchise)**.

The app captures high-intent leads (name, email, phone via OTP, target
country/course), runs a tiered adaptive diagnostic test, and hands off the
result to IMS Venturi mentors for a personalized, human follow-up rather than
exposing raw scores automatically. See [Diagnostic_Test.md](./Diagnostic_Test.md)
for the full product spec.

The data-capture flow (lead form → phone OTP verification via Supabase Auth
+ Twilio Verify → lead record insert) is implemented. Diagnostic test logic
is not yet built.

## Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Backend/Auth:** Supabase (phone OTP via Twilio Verify + Postgres database)
- **Deployment:** Vercel

## Project structure

```
src/
  components/   Shared, reusable UI components
  pages/        Top-level views/routes
  lib/          Client/service setup (e.g. Supabase client)
  hooks/        Custom React hooks
```

## Running locally

```bash
npm install
npm run dev
```

The app will be available at the URL printed in the terminal (typically
`http://localhost:5173`).

### Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Supabase setup

1. In the Supabase dashboard, enable **Phone** auth and configure Twilio
   Verify as the SMS provider.
2. Run [`supabase/leads.sql`](./supabase/leads.sql) in the SQL editor to
   create the `leads` table with row level security (authenticated users
   can insert their own row only — no public select/update/delete).

## Other scripts

```bash
npm run build      # Production build
npm run preview    # Preview the production build locally
npm run lint        # Lint the codebase
```
