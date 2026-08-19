-- Production hardening: schema consistency, strict roles, admin bootstrap and abuse protection.

-- 1) Keep profile schema consistent with the auth trigger and Google metadata.
alter table public.profiles add column if not exists full_name text;

-- 2) Keep admin semantics strict: only the admin role is a database administrator.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.profiles
    where id=auth.uid() and role='admin'
  )
$$;

create or replace function public.is_editor_or_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.profiles
    where id=auth.uid() and role in ('admin','editor')
  )
$$;

-- 3) Make the new-user trigger idempotent and safe for email/Google signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.profiles(id, full_name, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'user'
  )
  on conflict (id) do update set
    full_name=coalesce(public.profiles.full_name, excluded.full_name),
    display_name=coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url=coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at=now();
  return new;
end;
$$;

-- 4) Ensure the requested administrator is promoted if the account already exists.
do $$
declare
  target_id uuid;
begin
  select id into target_id
  from auth.users
  where lower(email)=lower('dakarlem050@gmail.com')
  limit 1;

  if target_id is not null then
    insert into public.profiles(id, role, full_name, display_name)
    values (target_id, 'admin', 'Muhammed Dakarli', 'Muhammed Dakarli')
    on conflict (id) do update set role='admin', updated_at=now();
  end if;
end;
$$;

-- 5) Rate limiting storage for public AI endpoints.
create table if not exists public.rate_limits(
  key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.rate_limits enable row level security;

-- The function is SECURITY DEFINER so anonymous callers never receive table access.
create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare
  current_window timestamptz;
  current_count integer;
begin
  if p_key is null or length(trim(p_key))=0 then
    return false;
  end if;
  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  select window_started_at, request_count
    into current_window, current_count
  from public.rate_limits
  where key=p_key
  for update;

  if not found then
    insert into public.rate_limits(key, window_started_at, request_count, updated_at)
    values(p_key, now(), 1, now());
    return true;
  end if;

  if current_window <= now() - make_interval(secs => p_window_seconds) then
    update public.rate_limits
    set window_started_at=now(), request_count=1, updated_at=now()
    where key=p_key;
    return true;
  end if;

  if current_count >= p_limit then
    update public.rate_limits set updated_at=now() where key=p_key;
    return false;
  end if;

  update public.rate_limits
  set request_count=current_count+1, updated_at=now()
  where key=p_key;
  return true;
end;
$$;

revoke all on table public.rate_limits from anon, authenticated;
revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to anon, authenticated;

create index if not exists rate_limits_updated_idx on public.rate_limits(updated_at);
