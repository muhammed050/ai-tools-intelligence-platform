create extension if not exists pg_trgm;

alter table public.tools add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.tools add column if not exists use_cases text[] not null default '{}';
alter table public.tools add column if not exists platforms text[] not null default '{}';
alter table public.tools add column if not exists pros text[] not null default '{}';
alter table public.tools add column if not exists cons text[] not null default '{}';
alter table public.tools add column if not exists screenshots jsonb not null default '[]';
alter table public.tools add column if not exists source_type text;
alter table public.tools add column if not exists confidence_score numeric(5,2);
alter table public.tools add column if not exists last_health_check_at timestamptz;
alter table public.tools add column if not exists health_status text;

create table if not exists public.tool_snapshots(id uuid primary key default gen_random_uuid(),tool_id uuid not null references public.tools(id) on delete cascade,source_url text not null,content_hash text not null,title text,description text,pricing jsonb,captured_at timestamptz not null default now());
create index if not exists tool_snapshots_tool_captured_idx on public.tool_snapshots(tool_id,captured_at desc);
create table if not exists public.ai_jobs(id uuid primary key default gen_random_uuid(),type text not null,status text not null default 'queued',input jsonb not null default '{}',output jsonb,error text,created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),started_at timestamptz,completed_at timestamptz);
create index if not exists ai_jobs_status_idx on public.ai_jobs(status,created_at desc);
create table if not exists public.conversions(id uuid primary key default gen_random_uuid(),affiliate_click_id uuid references public.affiliate_clicks(id) on delete set null,tool_id uuid references public.tools(id) on delete set null,external_reference text,amount numeric(12,2),currency char(3),converted_at timestamptz not null default now());
create index if not exists conversions_tool_idx on public.conversions(tool_id,converted_at desc);

alter table public.search_logs add column if not exists session_hash text;
alter table public.search_logs add column if not exists result_tool_ids uuid[] not null default '{}';
alter table public.affiliate_clicks add column if not exists landing_path text;
alter table public.reviews add column if not exists pros text[] not null default '{}';
alter table public.reviews add column if not exists cons text[] not null default '{}';
alter table public.reviews add column if not exists updated_at timestamptz not null default now();

create index if not exists tools_published_category_idx on public.tools(category_id) where status='published';
create index if not exists tools_rating_idx on public.tools(rating desc nulls last) where status='published';
create index if not exists tools_search_trgm_idx on public.tools using gin((name || ' ' || short_description || ' ' || description) gin_trgm_ops);
create index if not exists tool_features_feature_idx on public.tool_features(feature_id,tool_id);
create index if not exists pricing_plans_tool_active_idx on public.pricing_plans(tool_id,is_active);
create index if not exists affiliate_clicks_tool_idx on public.affiliate_clicks(tool_id,created_at desc);
create index if not exists tools_embedding_hnsw_idx on public.tools using hnsw (embedding vector_cosine_ops) where embedding is not null;

create or replace function public.match_tools(query_embedding vector(1536), match_threshold float default 0.35, match_count int default 24) returns table(id uuid, similarity float) language sql stable as $$ select t.id,1-(t.embedding <=> query_embedding) as similarity from public.tools t where t.status='published' and t.embedding is not null and 1-(t.embedding <=> query_embedding)>=match_threshold order by t.embedding <=> query_embedding limit match_count; $$;
create or replace function public.search_tools(search_query text, match_count int default 24) returns table(id uuid, rank real) language sql stable as $$ select t.id,ts_rank_cd(to_tsvector('english',coalesce(t.name,'')||' '||coalesce(t.short_description,'')||' '||coalesce(t.description,'')),websearch_to_tsquery('english',search_query)) as rank from public.tools t where t.status='published' and to_tsvector('english',coalesce(t.name,'')||' '||coalesce(t.short_description,'')||' '||coalesce(t.description,'')) @@ websearch_to_tsquery('english',search_query) order by rank desc,t.rating desc nulls last limit match_count; $$;

alter table public.tool_snapshots enable row level security;alter table public.ai_jobs enable row level security;alter table public.conversions enable row level security;alter table public.affiliate_programs enable row level security;alter table public.affiliate_links enable row level security;alter table public.affiliate_clicks enable row level security;alter table public.tool_claims enable row level security;alter table public.tool_updates enable row level security;alter table public.companies enable row level security;alter table public.features enable row level security;alter table public.tool_features enable row level security;alter table public.pricing_plans enable row level security;alter table public.collections enable row level security;alter table public.collection_tools enable row level security;alter table public.alerts enable row level security;

create policy "published companies" on public.companies for select using(verified=true or exists(select 1 from public.tools t where t.company_id=companies.id and t.status='published'));
create policy "public features" on public.features for select using(true);
create policy "public tool features" on public.tool_features for select using(exists(select 1 from public.tools t where t.id=tool_features.tool_id and t.status='published'));
create policy "public pricing plans" on public.pricing_plans for select using(exists(select 1 from public.tools t where t.id=pricing_plans.tool_id and t.status='published'));
create policy "public collections" on public.collections for select using(status='published');
create policy "public collection tools" on public.collection_tools for select using(exists(select 1 from public.collections c where c.id=collection_tools.collection_id and c.status='published'));
create policy "own alerts" on public.alerts for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "admin companies" on public.companies for all using(public.is_admin()) with check(public.is_admin());
create policy "admin features" on public.features for all using(public.is_admin()) with check(public.is_admin());
create policy "admin tool features" on public.tool_features for all using(public.is_admin()) with check(public.is_admin());
create policy "admin pricing" on public.pricing_plans for all using(public.is_admin()) with check(public.is_admin());
create policy "admin snapshots" on public.tool_snapshots for all using(public.is_admin()) with check(public.is_admin());
create policy "admin ai jobs" on public.ai_jobs for all using(public.is_admin()) with check(public.is_admin());
create policy "admin conversions" on public.conversions for all using(public.is_admin()) with check(public.is_admin());
create policy "admin affiliate programs" on public.affiliate_programs for all using(public.is_admin()) with check(public.is_admin());
create policy "admin affiliate links" on public.affiliate_links for all using(public.is_admin()) with check(public.is_admin());
create policy "admin affiliate clicks" on public.affiliate_clicks for all using(public.is_admin()) with check(public.is_admin());
create policy "admin claims" on public.tool_claims for all using(public.is_admin() or auth.uid()=claimant_id) with check(public.is_admin() or auth.uid()=claimant_id);
create policy "public updates" on public.tool_updates for select using(exists(select 1 from public.tools t where t.id=tool_updates.tool_id and t.status='published'));
create policy "admin updates" on public.tool_updates for all using(public.is_admin()) with check(public.is_admin());

create or replace function public.prevent_review_duplicates() returns trigger language plpgsql as $$ begin if exists(select 1 from public.reviews r where r.tool_id=new.tool_id and r.user_id=new.user_id and r.id<>coalesce(new.id,'00000000-0000-0000-0000-000000000000'::uuid) and r.status in('pending','approved','flagged')) then raise exception 'You already reviewed this tool'; end if; return new; end; $$;
drop trigger if exists review_duplicate_guard on public.reviews;create trigger review_duplicate_guard before insert or update on public.reviews for each row execute function public.prevent_review_duplicates();

create or replace function public.refresh_tool_rating() returns trigger language plpgsql as $$ declare tid uuid; begin tid:=coalesce(new.tool_id,old.tool_id); update public.tools set rating=(select avg(r.rating)::numeric(3,2) from public.reviews r where r.tool_id=tid and r.status='approved'),review_count=(select count(*)::int from public.reviews r where r.tool_id=tid and r.status='approved'),updated_at=now() where id=tid; return coalesce(new,old); end; $$;
drop trigger if exists refresh_tool_rating_trigger on public.reviews;create trigger refresh_tool_rating_trigger after insert or update or delete on public.reviews for each row execute function public.refresh_tool_rating();