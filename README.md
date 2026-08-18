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

Set the Supabase Site URL to the production domain and add local/preview redirect URLs in Authentication → URL Configuration as needed.

The application callback is `/auth/callback`; it exchanges the OAuth `code` with `exchangeCodeForSession()`.

### 3. Environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jranosrcpekjoxwpjvlk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to browser code, committed to Git, or prefixed with `NEXT_PUBLIC_`.

### 4. Database

Apply migrations in order from `supabase/migrations/` using the Supabase CLI or SQL editor. The authentication migration creates the profile trigger, protected role management RPCs, tool ownership, and RLS policies.

A new Auth user automatically receives a `profiles` row with role `user`. Google metadata (`name` / `full_name` and `avatar_url`) is copied when available. Users cannot assign themselves a role.

### 5. Admin bootstrap

After creating the first account, use the existing `supabase/admin-bootstrap.sql` with your intended administrator email. Review it before execution and do not expose service credentials in the browser.

### 6. Local development

```bash
npm install
npm run typecheck
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

Add the four environment variables to Vercel for Preview and Production. Set `NEXT_PUBLIC_SITE_URL` to the appropriate site origin for each environment. Configure the corresponding Supabase Site URL and redirect allow-list for localhost, Vercel Preview, and the production domain.

### Security model

- Supabase Auth owns sessions.
- SSR cookies are refreshed through middleware.
- Server-side role checks protect sensitive operations.
- Supabase RLS protects profiles, favorites, reviews, tools, claims, and admin logs.
- Role changes use a security-definer RPC that only an admin can execute.
- Profile updates use a controlled RPC so users cannot change their own role.
- The service-role key exists only in server-side code.
- OAuth callback accepts only a code and exchanges it server-side.
- User-facing errors are sanitized.

## AI Finder

The public `/ai-finder` route uses the existing database-backed discovery architecture. Authentication is not required for basic tool discovery; sign-in is required for account features such as favorites and profile data.
