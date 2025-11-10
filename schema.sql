-- Smart Prospect Supabase schema
-- Generated on 2025-11-10
-- Execute inside the Supabase SQL editor (connected as the service role)

begin;

create extension if not exists "pgcrypto" with schema public;
create extension if not exists "citext" with schema public;

create type public.campaign_status as enum (
  'in_erstllg',
  'bereit_zur_pruefung',
  'geprueft',
  'versandt'
);

create type public.credit_reason as enum (
  'signup_bonus',
  'purchase',
  'generation_debit',
  'manual_adjustment',
  'refund'
);

create type public.job_kind as enum ('generation', 'send');

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  full_name text,
  company_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated
before update on public.profiles
for each row execute function public.tg_set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.credit_events (
  id bigserial primary key,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  reason public.credit_reason not null,
  delta integer not null,
  reference_type text,
  reference_id uuid,
  notes text,
  metadata jsonb,
  stripe_event_id text,
  created_at timestamptz not null default now()
);

create index credit_events_user_idx on public.credit_events(user_id);

alter table public.credit_events enable row level security;

create policy "Users can see own credit events"
  on public.credit_events
  for select
  using (auth.uid() = user_id);

create view public.user_credit_balances as
select p.user_id,
       coalesce(sum(ce.delta), 0) as credits
from public.profiles p
left join public.credit_events ce on ce.user_id = p.user_id
group by p.user_id;

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  name text not null,
  status public.campaign_status not null default 'in_erstllg',
  row_count integer not null check (row_count > 0),
  source_excel_path text not null,
  service_pdf_path text not null,
  debit_event_id bigint unique references public.credit_events(id),
  generation_job_id text,
  send_job_id text,
  last_status_change timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index campaigns_user_idx on public.campaigns(user_id);
create index campaigns_status_idx on public.campaigns(status);

create trigger set_campaigns_updated
before update on public.campaigns
for each row execute function public.tg_set_updated_at();

create or replace function public.tg_touch_campaign_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.last_status_change := now();
  end if;
  return new;
end;
$$;

create trigger campaign_status_timestamp
before update on public.campaigns
for each row execute function public.tg_touch_campaign_status_change();

alter table public.campaigns enable row level security;

create policy "Users manage own campaigns"
  on public.campaigns
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.campaign_status_history (
  id bigserial primary key,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  prior_status public.campaign_status,
  next_status public.campaign_status not null,
  reason text,
  created_at timestamptz not null default now()
);

create index campaign_status_history_campaign_idx on public.campaign_status_history(campaign_id);

alter table public.campaign_status_history enable row level security;

create policy "Users read own campaign histories"
  on public.campaign_status_history
  for select
  using (
    auth.uid() = (select user_id from public.campaigns where id = campaign_id)
  );

create table public.campaign_prospects (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  row_index integer not null,
  company_url text not null,
  anrede text not null,
  vorname text not null,
  nachname text not null,
  strasse text not null,
  hausnummer text not null,
  plz text not null,
  ort text not null,
  qr_code_path text,
  flyer_pdf_path text,
  landingpage_path text,
  error_log jsonb,
  is_valid boolean not null default true,
  tracking_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index campaign_prospects_row_idx on public.campaign_prospects(campaign_id, row_index);

create trigger set_prospects_updated
before update on public.campaign_prospects
for each row execute function public.tg_set_updated_at();

alter table public.campaign_prospects enable row level security;

create policy "Users manage own prospects"
  on public.campaign_prospects
  using (
    auth.uid() = (select user_id from public.campaigns where id = campaign_id)
  )
  with check (
    auth.uid() = (select user_id from public.campaigns where id = campaign_id)
  );

create table public.n8n_job_runs (
  id bigserial primary key,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  kind public.job_kind not null,
  external_run_id text,
  request_payload jsonb,
  response_payload jsonb,
  status text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index n8n_job_runs_campaign_idx on public.n8n_job_runs(campaign_id);

alter table public.n8n_job_runs enable row level security;

create policy "Users read own n8n runs"
  on public.n8n_job_runs
  for select
  using (
    auth.uid() = (select user_id from public.campaigns where id = campaign_id)
  );

create table public.stripe_webhook_events (
  id bigserial primary key,
  stripe_event_id text not null unique,
  type text not null,
  livemode boolean,
  raw_payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text
);

alter table public.stripe_webhook_events enable row level security;

create policy "Service role only"
  on public.stripe_webhook_events
  using (false);

create table public.stripe_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  stripe_session_id text not null unique,
  stripe_customer_id text,
  stripe_price_id text not null,
  credit_quantity integer not null check (credit_quantity > 0),
  status text not null default 'open' check (status in ('open','complete','expired','async_payment_pending','async_payment_failed')),
  raw_session jsonb,
  completed_at timestamptz,
  credit_event_id bigint references public.credit_events(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stripe_checkout_sessions_user_idx on public.stripe_checkout_sessions(user_id);

create trigger set_checkout_sessions_updated
before update on public.stripe_checkout_sessions
for each row execute function public.tg_set_updated_at();

alter table public.stripe_checkout_sessions enable row level security;

create policy "Users read own checkout sessions"
  on public.stripe_checkout_sessions
  for select
  using (auth.uid() = user_id);

create or replace function public.assert_forward_campaign_status()
returns trigger
language plpgsql
as $$
declare
  status_order text[] := array['in_erstllg','bereit_zur_pruefung','geprueft','versandt'];
  old_idx int;
  new_idx int;
begin
  if tg_op = 'INSERT' or old.status = new.status then
    return new;
  end if;

  old_idx := array_position(status_order, old.status::text);
  new_idx := array_position(status_order, new.status::text);

  if new_idx is null or old_idx is null then
    raise exception 'Unknown campaign status transition';
  end if;

  if new_idx < old_idx then
    raise exception 'Campaign status cannot go backwards. Delete and recreate the campaign if needed.';
  end if;

  return new;
end;
$$;

create trigger campaign_forward_status_only
before update on public.campaigns
for each row execute function public.assert_forward_campaign_status();

create or replace function public.log_campaign_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.campaign_status_history(campaign_id, prior_status, next_status)
    values (new.id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into public.campaign_status_history(campaign_id, prior_status, next_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger campaign_status_audit
after insert or update on public.campaigns
for each row execute function public.log_campaign_status_change();

create or replace function public.prevent_row_count_mutation()
returns trigger
language plpgsql
as $$
begin
  if old.debit_event_id is not null and new.row_count <> old.row_count then
    raise exception 'Row count cannot change after credits were debited. Delete the campaign to re-upload.';
  end if;
  return new;
end;
$$;

create trigger campaign_rowcount_lock
before update on public.campaigns
for each row execute function public.prevent_row_count_mutation();

create or replace function public.auto_debit_campaign_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  available integer;
  evt_id bigint;
begin
  if new.id is null then
    new.id := gen_random_uuid();
  end if;

  if new.debit_event_id is not null then
    return new;
  end if;

  select credits into available
  from public.user_credit_balances
  where user_id = new.user_id;

  if coalesce(available, 0) < new.row_count then
    raise exception 'INSUFFICIENT_CREDITS' using detail = format('User %s has %s credits but %s required.', new.user_id, coalesce(available,0), new.row_count);
  end if;

  insert into public.credit_events(user_id, reason, delta, reference_type, reference_id, metadata)
  values (
    new.user_id,
    'generation_debit',
    -new.row_count,
    'campaign',
    new.id,
    jsonb_build_object('campaign_id', new.id, 'row_count', new.row_count)
  ) returning id into evt_id;

  new.debit_event_id := evt_id;
  return new;
end;
$$;

create trigger campaign_auto_debit
before insert on public.campaigns
for each row execute function public.auto_debit_campaign_credits();

create or replace function public.apply_checkout_credit(
  p_user_id uuid,
  p_stripe_session_id text,
  p_stripe_price_id text,
  p_credit_quantity integer,
  p_stripe_event_id text,
  p_raw_session jsonb default null
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  evt_id bigint;
begin
  if p_credit_quantity <= 0 then
    raise exception 'Credit quantity must be positive';
  end if;

  insert into public.credit_events(user_id, reason, delta, reference_type, reference_id, metadata, stripe_event_id)
  values (
    p_user_id,
    'purchase',
    p_credit_quantity,
    'stripe.checkout',
    null,
    jsonb_build_object('stripe_session_id', p_stripe_session_id, 'price_id', p_stripe_price_id),
    p_stripe_event_id
  ) returning id into evt_id;

  insert into public.stripe_checkout_sessions(user_id, stripe_session_id, stripe_customer_id, stripe_price_id, credit_quantity, status, raw_session, completed_at, credit_event_id)
  values (
    p_user_id,
    p_stripe_session_id,
    coalesce(p_raw_session->>'customer', p_raw_session->'customer_details'->>'email'),
    p_stripe_price_id,
    p_credit_quantity,
    'complete',
    p_raw_session,
    now(),
    evt_id
  )
  on conflict (stripe_session_id) do update
  set status = 'complete',
      raw_session = excluded.raw_session,
      completed_at = now(),
      credit_event_id = evt_id;

  return evt_id;
end;
$$;

revoke all on function public.apply_checkout_credit(uuid, text, text, integer, text, jsonb) from public;
grant execute on function public.apply_checkout_credit(uuid, text, text, integer, text, jsonb) to service_role;
 
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_full_name text;
begin
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email);

  insert into public.profiles(user_id, email, full_name)
  values (new.id, new.email, v_full_name)
  on conflict (user_id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);

  if not exists (
    select 1
    from public.credit_events
    where user_id = new.id and reason = 'signup_bonus'
  ) then
    insert into public.credit_events(user_id, reason, delta, reference_type, metadata)
    values (
      new.id,
      'signup_bonus',
      5,
      'signup_bonus',
      jsonb_build_object('source', 'magic_link')
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

commit;
