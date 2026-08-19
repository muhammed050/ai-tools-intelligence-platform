# AI Tools Intelligence Platform

Production-ready Next.js + Supabase platform for discovering and comparing AI tools.

## Authentication Setup

Authentication uses Supabase Auth and server-managed SSR cookies. There is no localStorage or custom authentication system.

### 1. Supabase

Create or use a Supabase project and enable Email/Password under Authentication → Providers.

Project URL for this deployment:
`https://jranosrcpekjoxwpjvlk.supabase.co`

### 2. Google OAuth

In Google Cloud Console create an OAuth 2.0 Web Client. In Supabase Authentication → Providers → Google, configure the Google Client ID and Client Secret. Keep the client secret in Supabase only; never add it to a `NEXT_PUBLIC_*` variable.

Add this Supabase callback URL to Google:
`https://jranosrcpekjoxwpjvlk.supabase.co/auth/v1/callback`

Set the Supabase Site URL to the production domain and add local/preview redirect URLs in Authentication → URL Configuration as needed. The production application callback is `/auth/callback` and exchanges the OAuth `code` server-side.

### 3. Environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jranosrcpekjoxwpjvlk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For Vercel Production, set every variable below for **Production** (and Preview/Development as appropriate). Keep only the two `NEXT_PUBLIC_*` variables and `NEXT_PUBLIC_SITE_URL` exposed to browser-safe configuration. The production site URL is currently:

```env
NEXT_PUBLIC_SITE_URL=https://ai-tools-intelligence-platform-iota.vercel.app

# Server-only secrets and provider configuration
SUPABASE_SERVICE_ROLE_KEY=...
AI_PROVIDER_API_KEY=...
AI_PROVIDER_BASE_URL=https://api.openai.com/v1
AI_PROVIDER_MODEL=gpt-5-mini
EMBEDDING_MODEL=text-embedding-3-small
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to browser code, committed to Git, or prefixed with `NEXT_PUBLIC_`.

### 4. Database

Apply every migration in `supabase/migrations/` using the Supabase CLI or SQL editor. The production hardening migration adds the missing `profiles.full_name` column, normalizes admin/editor role checks, bootstraps the primary administrator when the account exists, and creates the database-backed rate limiter used by the public AI Finder.

A new Auth user automatically receives a `profiles` row with role `user`. Google metadata (`name` / `full_name` and `avatar_url`) is copied when available. Users cannot assign themselves a role.

### 5. Primary administrator

The requested administrator is:

`dakarlem050@gmail.com`

Migration `004_production_hardening.sql` promotes this account to `admin` when it exists. `supabase/admin-bootstrap.sql` is also provided as an idempotent manual fallback after the Auth account has been created.

### 6. Local development

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

Authentication routes:

- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/callback`

Protected routes include `/dashboard/*` and role-protected `/admin/*`. Public AI tool discovery remains available without authentication.

### 7. Vercel

Set the four environment variables for **Production**. Set `NEXT_PUBLIC_SITE_URL` to the production origin. Configure the corresponding Supabase Site URL and redirect allow-list for localhost, Vercel Preview, and the production domain.

The AI Finder also has a database-backed abuse limiter: anonymous users receive 10 searches/hour and authenticated users receive 100 searches/day.

### Security model

- Supabase Auth owns sessions.
- SSR cookies are refreshed through one shared middleware implementation.
- Server-side role checks protect sensitive operations.
- Supabase RLS protects profiles, favorites, reviews, tools, claims, and admin logs.
- Only the `admin` role is considered an administrator; `editor` is limited to editor areas.
- Role changes use a security-definer RPC that only an admin can execute.
- Profile updates use a controlled RPC so users cannot change their own role.
- The service-role key exists only in server-side code.
- OAuth callback accepts only a code and exchanges it server-side.
- Public AI requests are rate-limited before expensive AI work.
- User-facing errors are sanitized.

## AI Finder

The public `/ai-finder` route uses the database-backed discovery architecture. Authentication is not required for basic tool discovery; sign-in is required for account features such as favorites and profile data.
