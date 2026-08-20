-- Production catalog hardening.
-- NOTE: rate_limits was intentionally removed from the production database.
-- Do not recreate consume_rate_limit or reference public.rate_limits here.
-- Keep this migration safe for fresh environments and consistent with the
-- current production schema.

-- Preserve existing records while adding an explicitly managed affiliate destination.
alter table public.tools add column if not exists affiliate_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tools'::regclass
      and conname = 'tools_affiliate_url_http'
  ) then
    alter table public.tools
      add constraint tools_affiliate_url_http
      check (affiliate_url is null or affiliate_url ~* '^https?://') not valid;
  end if;
end
$$;

alter table public.tools validate constraint tools_affiliate_url_http;
