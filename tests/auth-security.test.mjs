import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('Supabase auth configuration never exposes service role in public env', async () => {
  const env = await readFile('.env.example', 'utf8')
  assert.match(env, /NEXT_PUBLIC_SUPABASE_URL=/)
  assert.match(env, /NEXT_PUBLIC_SUPABASE_ANON_KEY=/)
  assert.match(env, /SUPABASE_SERVICE_ROLE_KEY=/)
  assert.doesNotMatch(env, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/)
})

test('OAuth callback exchanges the authorization code server-side', async () => {
  const source = await readFile('app/auth/callback/route.ts', 'utf8')
  assert.match(source, /exchangeCodeForSession\(code\)/)
  assert.match(source, /searchParams\.get\('code'\)/)
})

test('protected routes are covered by the shared proxy', async () => {
  const source = await readFile('proxy.ts', 'utf8')
  const shared = await readFile('lib/supabase/middleware.ts', 'utf8')
  assert.match(source, /proxy\(/)
  assert.match(source, /updateSession/)
  assert.match(shared, /dashboard/)
  assert.match(shared, /admin/)
  assert.match(shared, /auth\/sign-in/)
})

test('role management is server-side and blocks self escalation', async () => {
  const source = await readFile('supabase/migrations/002_auth_production.sql', 'utf8')
  assert.match(source, /is_admin\(\)/)
  assert.match(source, /SELF_ROLE_CHANGE_NOT_ALLOWED/)
  assert.match(source, /grant execute on function public\.set_user_role/)
})

test('production hardening adds the profile column, strict admin role and requested bootstrap email', async () => {
  const source = await readFile('supabase/migrations/004_production_hardening.sql', 'utf8')
  assert.match(source, /add column if not exists full_name text/)
  assert.match(source, /role='admin'/)
  assert.match(source, /dakarlem050@gmail\.com/)
  assert.match(source, /consume_rate_limit/)
})

test('user workflow migration keeps submissions private and reviews pending', async () => {
  const source = await readFile('supabase/migrations/005_user_workflows.sql', 'utf8')
  assert.match(source, /create table if not exists public\.tool_submissions/)
  assert.match(source, /submitters read submissions/)
  assert.match(source, /status='pending'/)
  assert.match(source, /alter table public\.collections add column if not exists owner_id uuid/)
})
