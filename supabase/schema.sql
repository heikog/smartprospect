create extension if not exists "pgcrypto";

do $$
begin
  create type public.campaign_status as enum ('draft','generating','review','approved','sent');
exception
  when duplicate_object then null;
end$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  credits integer not null default 0 check (credits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  status public.campaign_status not null default 'draft',
  excel_path text not null,
  pdf_path text not null,
  n8n_job_id text,
  prospect_count integer not null default 0,
  credits_spent integer not null default 0,
  progress integer not null default 0,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  company_name text,
  contact jsonb default '{}'::jsonb,
  status text not null default 'pending',
  landing_page_url text,
  video_url text,
  audio_url text,
  presentation_url text,
  flyer_url text,
  assets jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_campaigns_user on public.campaigns(user_id);
create index if not exists idx_prospects_campaign on public.prospects(campaign_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_timestamp_campaigns on public.campaigns;
create trigger set_timestamp_campaigns
before update on public.campaigns
for each row execute function public.touch_updated_at();

do $$
begin
  create table public.credit_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    campaign_id uuid references public.campaigns(id) on delete set null,
    type text not null check (type in ('purchase','spend','adjustment')),
    amount integer not null,
    description text,
    created_at timestamptz not null default now()
  );
exception
  when duplicate_table then null;
end$$;

create index if not exists idx_credit_transactions_user on public.credit_transactions(user_id);

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.prospects enable row level security;
alter table public.credit_transactions enable row level security;

drop policy if exists "View own profile" on public.profiles;
create policy "View own profile" on public.profiles
  for select using (id = auth.uid());
drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update using (id = auth.uid());

drop policy if exists "Insert campaigns" on public.campaigns;
create policy "Insert campaigns" on public.campaigns
  for insert with check (auth.uid() = user_id);
drop policy if exists "Select own campaigns" on public.campaigns;
create policy "Select own campaigns" on public.campaigns
  for select using (auth.uid() = user_id);
drop policy if exists "Update own campaigns" on public.campaigns;
create policy "Update own campaigns" on public.campaigns
  for update using (auth.uid() = user_id);

drop policy if exists "Select campaign prospects" on public.prospects;
create policy "Select campaign prospects" on public.prospects
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.user_id = auth.uid()
    )
  );
drop policy if exists "Insert campaign prospects" on public.prospects;
create policy "Insert campaign prospects" on public.prospects
  for insert with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.user_id = auth.uid()
    )
  );
drop policy if exists "Update campaign prospects" on public.prospects;
create policy "Update campaign prospects" on public.prospects
  for update using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Select own credit transactions" on public.credit_transactions;
create policy "Select own credit transactions" on public.credit_transactions
  for select using (user_id = auth.uid());

drop policy if exists "Insert own credit transactions" on public.credit_transactions;
create policy "Insert own credit transactions" on public.credit_transactions
  for insert with check (user_id = auth.uid());

drop policy if exists "Service role manages credit transactions" on public.credit_transactions;
create policy "Service role manages credit transactions" on public.credit_transactions
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create or replace function public.spend_credits(p_amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  update public.profiles
  set credits = credits - p_amount,
      updated_at = now()
  where id = _uid and credits >= p_amount;
  if not found then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;
end;
$$;

grant execute on function public.spend_credits(integer) to authenticated;

create or replace function public.add_credits_to_user(p_user uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;
  update public.profiles
  set credits = credits + p_amount,
      updated_at = now()
  where id = p_user;
end;
$$;

grant execute on function public.add_credits_to_user(uuid, integer) to service_role;

create or replace function public.deduct_credits_from_user(p_user uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  update public.profiles
  set credits = credits - p_amount,
      updated_at = now()
  where id = p_user and credits >= p_amount;

  if not found then
    raise exception 'INSUFFICIENT_CREDITS_FOR_USER';
  end if;
end;
$$;

grant execute on function public.deduct_credits_from_user(uuid, integer) to service_role;

insert into storage.buckets (id, name, public)
values ('campaign-uploads', 'campaign-uploads', false)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('generated-assets', 'generated-assets', false)
on conflict do nothing;

drop policy if exists "Campaign uploads read" on storage.objects;
create policy "Campaign uploads read" on storage.objects
  for select using (
    bucket_id = 'campaign-uploads'
    and auth.role() = 'authenticated'
    and split_part(name, '/', 1) = auth.uid()::text
  );
drop policy if exists "Campaign uploads write" on storage.objects;
create policy "Campaign uploads write" on storage.objects
  for insert with check (
    bucket_id = 'campaign-uploads'
    and auth.role() = 'authenticated'
    and split_part(name, '/', 1) = auth.uid()::text
  );
drop policy if exists "Generated assets read" on storage.objects;
create policy "Generated assets read" on storage.objects
  for select using (
    bucket_id = 'generated-assets'
    and auth.role() = 'authenticated'
    and split_part(name, '/', 1) = auth.uid()::text
  );
drop policy if exists "Generated assets write" on storage.objects;
create policy "Generated assets write" on storage.objects
  for insert with check (
    bucket_id = 'generated-assets'
    and auth.role() in ('authenticated')
    and split_part(name, '/', 1) = auth.uid()::text
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 0)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
