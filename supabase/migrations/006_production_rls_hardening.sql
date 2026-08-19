-- Production RLS hardening for legacy tables identified by Supabase security advisors.
-- These tables have no trustworthy per-user ownership column, so sensitive legacy data is deny-by-default.

alter table public.debts enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.goal enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.savings enable row level security;
alter table public.search_logs enable row level security;

drop policy if exists "Enable read access for all users" on public.debts;
drop policy if exists "exchange rates public read" on public.exchange_rates;
create policy "exchange rates public read" on public.exchange_rates for select to anon, authenticated using (true);

drop policy if exists "newsletter public insert" on public.newsletter_subscribers;
create policy "newsletter public insert" on public.newsletter_subscribers for insert to anon, authenticated with check (true);

revoke all on public.debts from anon, authenticated;
revoke all on public.goal from anon, authenticated;
revoke all on public.savings from anon, authenticated;
revoke all on public.search_logs from anon, authenticated;
revoke all on public.newsletter_subscribers from anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select on public.exchange_rates to anon, authenticated;
