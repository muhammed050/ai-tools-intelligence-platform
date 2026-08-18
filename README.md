# AI Tools Intelligence Platform — production foundation

Run:
1. Copy `.env.example` to `.env.local`.
2. Put your Supabase URL + anon key in `.env.local`.
3. Run `supabase/migrations/001_initial.sql` in Supabase SQL Editor.
4. Create an account at `/auth/sign-up`.
5. Replace `YOUR_ADMIN_EMAIL` in `supabase/admin-bootstrap.sql` and run it.
6. `npm install`
7. `npm run typecheck`
8. `npm run build`
9. `npm run dev`

The dev script uses Webpack intentionally to avoid the Turbopack Unicode-path crash encountered on Windows.
