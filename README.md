# AI Tools Intelligence Platform

Production-oriented Next.js + Supabase directory for finding the right AI tool for a user's job.

## Stack

- Next.js 16 + TypeScript
- Supabase Auth, Postgres, RLS and pgvector
- Tailwind CSS v4
- Zod validation
- OpenAI-compatible provider abstraction for intent extraction and embeddings
- Vercel deployment target

## Local setup

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run build
npm test
npm run dev
```

Run migrations in Supabase SQL Editor, in order:

1. `supabase/migrations/001_initial.sql`
2. `supabase/migrations/002_production_intelligence.sql`
3. `supabase/migrations/003_security_rls.sql`

Then create a user at `/auth/sign-up` and run `supabase/admin-bootstrap.sql` after replacing the bootstrap email with your own admin email.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase publishable/anon key.
- `NEXT_PUBLIC_SITE_URL` — canonical production URL.
- `AI_PROVIDER_API_KEY` — server-only API key for the configured OpenAI-compatible provider.
- `AI_PROVIDER_BASE_URL` — provider API base URL.
- `AI_PROVIDER_MODEL` — structured-output model.
- `EMBEDDING_MODEL` — embedding model. The production schema currently requires 1536 dimensions and the provider is called with `dimensions=1536`.
- `EMBEDDING_DIMENSIONS` — documentation/configuration value; keep it at `1536` unless the database migration is changed to a matching vector dimension.
- `CRON_SECRET` — optional secret for future scheduled monitoring endpoints.

Never expose server-only keys with `NEXT_PUBLIC_` prefixes.

## AI Finder

`/ai-finder` sends the natural-language request to a server route. With `AI_PROVIDER_API_KEY`, intent extraction is performed by the configured provider. Without a key, development uses an explicitly labeled deterministic parser. Search combines PostgreSQL full-text retrieval with pgvector similarity when embeddings are available, then applies deterministic recommendation scoring.

Affiliate conversion weight remains neutral until first-party conversion data exists, preventing affiliate performance from silently controlling organic recommendations.

## Tool ingestion and monitoring

Public-page importing is limited to HTTP(S), checks a public robots policy before fetching, applies a size limit and never attempts CAPTCHA or authentication bypass. Extracted facts must be present in the source text. Health checks use ordinary public HTTP requests.

## Vercel

Import the repository into Vercel, configure the environment variables for Production/Preview as appropriate, and use the standard Next.js build command. The Next.js config intentionally contains no Turbopack-specific root setting.

## Security

Admin mutations use server-side `requireAdmin()` and Supabase RLS. Affiliate destinations and provider secrets are never sent to the browser. Anonymous search/click telemetry stores hashed session identifiers rather than raw IP addresses. Admin routes are not allowed in `robots.txt`.

## Data integrity

Ratings are derived from approved reviews by a database trigger. The platform does not manufacture ratings, reviews, pricing, features, revenue, conversion or visitor metrics. Empty metrics are represented as unavailable rather than fabricated.
