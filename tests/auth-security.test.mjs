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

test('protected routes are covered by middleware', async () => {
  const source = await readFile('middleware.ts', 'utf8')
  assert.match(source, /dashboard/)
  assert.match(source, /admin/)
  assert.match(source, /auth\/sign-in/)
})

test('role management is server-side and blocks self escalation', async () => {
  const source = await readFile('supabase/migrations/002_auth_production.sql', 'utf8')
  assert.match(source, /is_admin\(\)/)
  assert.match(source, /SELF_ROLE_CHANGE_NOT_ALLOWED/)
  assert.match(source, /grant execute on function public\.set_user_role/)
})
