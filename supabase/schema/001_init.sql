-- Smart Prospect initial schema
-- Run with: supabase db push --file supabase/schema/001_init.sql

-- Extensions ---------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enumerations ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'campaign_status') then
    create type campaign_status as enum (
      'created',
      'generating',
      'generation_failed',
      'generated',
      'ready_for_review',
      'approved',
      'ready_for_dispatch',
      'dispatched',
      'dispatch_failed'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'prospect_status') then
    create type prospect_status as enum (
      'creating',
      'ready',
      'error'
    );
  end if;
end $$;

-- Helper function for updated_at ------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Users -------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_users
before update on public.users
for each row execute procedure set_updated_at();

-- Campaigns ---------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  service_pdf_path text not null,
  total_prospects integer not null default 0 check (total_prospects >= 0),
  status campaign_status not null default 'created',
  last_error text,
  summary jsonb,
  approved_at timestamptz,
  dispatched_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_timestamp_campaigns
before update on public.campaigns
for each row execute procedure set_updated_at();

create index if not exists campaigns_owner_idx on public.campaigns (owner_id);

-- Prospects ---------------------------------------------------------------
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  ordinal integer not null default 0,
  url text not null,
  anrede text not null,
  vorname text not null,
  nachname text not null,
  strasse text not null,
  hausnummer text not null,
  plz text not null,
  stadt text not null,
  asset_status prospect_status not null default 'creating',
  asset_paths jsonb not null default '{}'::jsonb,
  landing_slug text,
  landing_page_path text,
  pdf_path text,
  generated_at timestamptz,
  reviewed_at timestamptz,
  dispatched_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, ordinal)
);

create trigger set_timestamp_prospects
before update on public.prospects
for each row execute procedure set_updated_at();

create index if not exists prospects_campaign_idx on public.prospects (campaign_id);
create index if not exists prospects_status_idx on public.prospects (asset_status);

-- Campaign Events ---------------------------------------------------------
create table if not exists public.campaign_events (
  id bigserial primary key,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  event_type text not null,
  message text,
  payload jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists campaign_events_campaign_idx on public.campaign_events (campaign_id, created_at desc);

-- Row Level Security ------------------------------------------------------
alter table public.users enable row level security;
alter table public.campaigns enable row level security;
alter table public.prospects enable row level security;
alter table public.campaign_events enable row level security;

-- Users policies
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
on public.users
for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update using (auth.uid() = id)
with check (auth.uid() = id);

-- Campaign policies
drop policy if exists "Campaign owners full access" on public.campaigns;
create policy "Campaign owners full access"
on public.campaigns
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Service role access campaigns" on public.campaigns;
create policy "Service role access campaigns"
on public.campaigns
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Prospect policies
drop policy if exists "Campaign owners read prospects" on public.prospects;
create policy "Campaign owners read prospects"
on public.prospects
for select using (
  auth.uid() in (
    select owner_id from public.campaigns where id = prospects.campaign_id
  )
);

drop policy if exists "Campaign owners update prospects" on public.prospects;
create policy "Campaign owners update prospects"
on public.prospects
for update using (
  auth.uid() in (
    select owner_id from public.campaigns where id = prospects.campaign_id
  )
)
with check (
  auth.uid() in (
    select owner_id from public.campaigns where id = prospects.campaign_id
  )
);

drop policy if exists "Service role access prospects" on public.prospects;
create policy "Service role access prospects"
on public.prospects
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Campaign events policies
drop policy if exists "Campaign owners read events" on public.campaign_events;
create policy "Campaign owners read events"
on public.campaign_events
for select using (
  auth.uid() in (
    select owner_id from public.campaigns where id = campaign_events.campaign_id
  )
);

drop policy if exists "Service role manage events" on public.campaign_events;
create policy "Service role manage events"
on public.campaign_events
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Functions / Views -------------------------------------------------------
-- View for public landing page consumption (restricted columns)
create or replace view public.prospect_landing_view as
select
  p.id as prospect_id,
  p.campaign_id,
  p.landing_slug,
  p.landing_page_path,
  p.pdf_path,
  p.asset_paths,
  p.vorname,
  p.nachname,
  p.anrede,
  p.stadt,
  c.owner_id
from public.prospects p
join public.campaigns c on c.id = p.campaign_id;

alter view public.prospect_landing_view set (security_invoker = true);

-- Allow public anonymous access via signed headers handled in backend (no direct RLS policies)
