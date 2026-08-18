alter table public.search_logs enable row level security;
create policy "search logs insert" on public.search_logs for insert with check(user_id is null or user_id=auth.uid());
create policy "search logs admin" on public.search_logs for select using(public.is_admin());
create policy "affiliate click insert" on public.affiliate_clicks for insert with check(true);
create policy "affiliate click admin read" on public.affiliate_clicks for select using(public.is_admin());

create policy "own review update" on public.reviews for update using(auth.uid()=user_id and status='pending') with check(auth.uid()=user_id and status='pending');
create policy "admin review moderation" on public.reviews for update using(public.is_admin()) with check(public.is_admin());
create policy "admin review delete" on public.reviews for delete using(public.is_admin());

alter table public.newsletter_subscribers enable row level security;
create policy "newsletter subscribe" on public.newsletter_subscribers for insert with check(true);
create policy "newsletter admin" on public.newsletter_subscribers for select using(public.is_admin());

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role in('admin','editor'));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
