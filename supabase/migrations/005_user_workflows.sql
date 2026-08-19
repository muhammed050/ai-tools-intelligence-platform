-- User workflow persistence: moderated submissions, owned collections and strict review creation.

create table if not exists public.tool_submissions(
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid not null references auth.users(id) on delete cascade,
  contact_email text not null,
  name text not null,
  website_url text not null,
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  pricing_type text,
  features text[] not null default '{}',
  logo_url text,
  use_cases text[] not null default '{}',
  status text not null default 'pending' check(status in ('pending','in_review','approved','rejected')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tool_submissions_status_idx on public.tool_submissions(status,created_at desc);
create index if not exists tool_submissions_submitter_idx on public.tool_submissions(submitter_id,created_at desc);
alter table public.tool_submissions enable row level security;
drop policy if exists "submitters create submissions" on public.tool_submissions;
drop policy if exists "submitters read submissions" on public.tool_submissions;
drop policy if exists "moderate submissions" on public.tool_submissions;
drop policy if exists "admin delete submissions" on public.tool_submissions;
create policy "submitters create submissions" on public.tool_submissions for insert to authenticated with check((select auth.uid())=submitter_id);
create policy "submitters read submissions" on public.tool_submissions for select to authenticated using(submitter_id=(select auth.uid()) or public.is_editor_or_admin());
create policy "moderate submissions" on public.tool_submissions for update to authenticated using(public.is_editor_or_admin()) with check(public.is_editor_or_admin());
create policy "admin delete submissions" on public.tool_submissions for delete to authenticated using(public.is_admin());

alter table public.collections add column if not exists owner_id uuid references auth.users(id) on delete cascade;
create index if not exists collections_owner_idx on public.collections(owner_id,created_at desc);
drop policy if exists "public collections" on public.collections;
drop policy if exists "public collection tools" on public.collection_tools;
drop policy if exists "published collections" on public.collections;
drop policy if exists "owners manage collections" on public.collections;
drop policy if exists "collection moderators" on public.collections;
drop policy if exists "published collection tools" on public.collection_tools;
drop policy if exists "owners manage collection tools" on public.collection_tools;
drop policy if exists "collection moderators manage tools" on public.collection_tools;
create policy "published collections" on public.collections for select using(status='published' or owner_id=(select auth.uid()) or public.is_editor_or_admin());
create policy "owners manage collections" on public.collections for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "collection moderators" on public.collections for all to authenticated using(public.is_editor_or_admin()) with check(public.is_editor_or_admin());
create policy "published collection tools" on public.collection_tools for select using(exists(select 1 from public.collections c where c.id=collection_id and (c.status='published' or c.owner_id=(select auth.uid()) or public.is_editor_or_admin())));
create policy "owners manage collection tools" on public.collection_tools for all to authenticated using(exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=(select auth.uid()))) with check(exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=(select auth.uid())));
create policy "collection moderators manage tools" on public.collection_tools for all to authenticated using(public.is_editor_or_admin()) with check(public.is_editor_or_admin());

drop policy if exists "reviews authenticated insert" on public.reviews;
create policy "reviews authenticated insert" on public.reviews for insert to authenticated with check((select auth.uid())=user_id and status='pending');
