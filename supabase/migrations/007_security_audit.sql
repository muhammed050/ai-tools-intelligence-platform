-- Allow only administrators to create audit records through authenticated server operations.
alter table public.admin_logs enable row level security;
drop policy if exists "admin logs admin insert" on public.admin_logs;
create policy "admin logs admin insert" on public.admin_logs
  for insert to authenticated
  with check(public.is_admin() and admin_id=auth.uid());