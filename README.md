# Diagnostic Test

A mobile-first diagnostic "Readiness Scorecard" for GMAT, GRE, and SAT prep,
built for **IMS Venturi (Vadodara Franchise)**.

The app captures high-intent leads (name, email, phone via OTP, target
country/course), runs a tiered adaptive diagnostic test, and hands off the
result to IMS Venturi mentors for a personalized, human follow-up rather than
exposing raw scores automatically. See [Diagnostic_Test.md](./Diagnostic_Test.md)
for the full product spec.

This repo currently contains infrastructure scaffolding only — no auth, data
capture, or test logic yet.

## Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Backend/Auth:** Supabase (Auth/OTP + database) — not yet wired up
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

## Other scripts

```bash
npm run build      # Production build
npm run preview    # Preview the production build locally
npm run lint        # Lint the codebase
```
