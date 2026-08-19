-- Production hardening added after the legacy duplicate 007 migrations.
-- Keep rate-limit mutation atomic and prevent callers from consuming a named user's quota.
create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := now();
  v_count integer;
begin
  if p_key is null or length(trim(p_key)) = 0 or length(p_key) > 200 or p_limit < 1 or p_limit > 1000 or p_window_seconds < 1 or p_window_seconds > 86400 then
    return false;
  end if;
  if p_key like 'user:%' and p_key <> 'user:' || coalesce(auth.uid()::text, '') then
    return false;
  end if;
  if p_key !~ '^(user:[0-9a-f-]{36}|ip:[0-9a-f]{64})$' then
    return false;
  end if;
  insert into public.rate_limits(key, window_started_at, request_count, updated_at)
  values (p_key, v_now, 1, v_now)
  on conflict (key) do update
    set request_count = case when public.rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= v_now then 1 else public.rate_limits.request_count + 1 end,
        window_started_at = case when public.rate_limits.window_started_at + make_interval(secs => p_window_seconds) <= v_now then v_now else public.rate_limits.window_started_at end,
        updated_at = v_now
  returning request_count into v_count;
  return v_count <= p_limit;
end;
$$;

revoke execute on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to anon, authenticated, service_role;

-- Preserve existing records while adding an explicitly managed affiliate destination.
alter table public.tools add column if not exists affiliate_url text;
alter table public.tools add constraint tools_affiliate_url_http check (affiliate_url is null or affiliate_url ~* '^https?://') not valid;
alter table public.tools validate constraint tools_affiliate_url_http;
