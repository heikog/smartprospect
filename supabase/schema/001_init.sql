-- Smart Prospect schema (idempotent rebuild)
-- Run with: supabase db push --file supabase/schema/001_init.sql

-- -----------------------------------------------------------------------
-- Drop existing objects so the script can be re-run safely
-- -----------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'prospect_landing_view'
  ) THEN
    EXECUTE 'DROP VIEW IF EXISTS public.prospect_landing_view';
  END IF;
END $$;

DROP TABLE IF EXISTS public.campaign_events CASCADE;
DROP TABLE IF EXISTS public.prospects CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.credit_ledger CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.deduct_campaign_credits(uuid, uuid, integer, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.refund_campaign(uuid, uuid, integer, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

DROP TYPE IF EXISTS public.campaign_status CASCADE;
DROP TYPE IF EXISTS public.prospect_status CASCADE;

-- -----------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------
-- Enumerations
-- -----------------------------------------------------------------------
CREATE TYPE campaign_status AS ENUM (
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

CREATE TYPE prospect_status AS ENUM (
  'creating',
  'ready',
  'error'
);

-- -----------------------------------------------------------------------
-- Helper Functions
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------
-- Core Tables
-- -----------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  credits integer NOT NULL DEFAULT 0,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE public.credit_ledger (
  id bigserial PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change integer NOT NULL,
  reason text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

CREATE INDEX credit_ledger_profile_idx ON public.credit_ledger (profile_id, created_at DESC);

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  service_pdf_path text NOT NULL,
  total_prospects integer NOT NULL DEFAULT 0 CHECK (total_prospects >= 0),
  status campaign_status NOT NULL DEFAULT 'created',
  credit_cost integer NOT NULL DEFAULT 0,
  last_error text,
  summary jsonb,
  approved_at timestamptz,
  dispatched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

CREATE TRIGGER set_timestamp_campaigns
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX campaigns_owner_idx ON public.campaigns (owner_id);
CREATE INDEX campaigns_status_idx ON public.campaigns (status);

CREATE TABLE public.prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  ordinal integer NOT NULL DEFAULT 0,
  url text NOT NULL,
  anrede text NOT NULL,
  vorname text NOT NULL,
  nachname text NOT NULL,
  strasse text NOT NULL,
  hausnummer text NOT NULL,
  plz text NOT NULL,
  stadt text NOT NULL,
  asset_status prospect_status NOT NULL DEFAULT 'creating',
  asset_paths jsonb NOT NULL DEFAULT '{}'::jsonb,
  landing_slug text,
  landing_page_path text,
  pdf_path text,
  qr_url text,
  email_capture_status text NOT NULL DEFAULT 'none',
  generated_at timestamptz,
  reviewed_at timestamptz,
  dispatched_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz,
  UNIQUE (campaign_id, ordinal)
);

CREATE TRIGGER set_timestamp_prospects
BEFORE UPDATE ON public.prospects
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX prospects_campaign_idx ON public.prospects (campaign_id);
CREATE INDEX prospects_status_idx ON public.prospects (asset_status);

CREATE TABLE public.campaign_events (
  id bigserial PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  message text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

CREATE INDEX campaign_events_campaign_idx ON public.campaign_events (campaign_id, created_at DESC);

-- -----------------------------------------------------------------------
-- Functions for Business Logic
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  initial_credits integer := 50;
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT DO NOTHING;

  UPDATE public.profiles
  SET email = COALESCE(NEW.email, public.profiles.email),
      deleted_at = NULL,
      updated_at = timezone('utc', now())
  WHERE id = NEW.id;

  IF NOT EXISTS (
    SELECT 1 FROM public.credit_ledger
    WHERE profile_id = NEW.id AND reason = 'signup_bonus'
  ) THEN
    UPDATE public.profiles
    SET credits = credits + initial_credits,
        updated_at = timezone('utc', now())
    WHERE id = NEW.id;

    INSERT INTO public.credit_ledger (profile_id, change, reason, meta)
    VALUES (
      NEW.id,
      initial_credits,
      'signup_bonus',
      jsonb_build_object('source', 'handle_new_user')
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_new_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.deduct_campaign_credits(
  p_profile_id uuid,
  p_campaign_id uuid,
  p_total_cost integer,
  p_reason text DEFAULT 'campaign_charge',
  p_meta jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits integer;
BEGIN
  IF p_total_cost <= 0 THEN
    RETURN;
  END IF;

  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE id = p_profile_id AND deleted_at IS NULL
  FOR UPDATE;

  IF current_credits IS NULL THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;

  IF current_credits < p_total_cost THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  UPDATE public.profiles
  SET credits = credits - p_total_cost,
      updated_at = timezone('utc', now())
  WHERE id = p_profile_id;

  INSERT INTO public.credit_ledger (profile_id, change, reason, meta)
  VALUES (
    p_profile_id,
    -p_total_cost,
    p_reason,
    coalesce(p_meta, '{}'::jsonb) || jsonb_build_object('campaign_id', p_campaign_id)
  );

  UPDATE public.campaigns
  SET credit_cost = credit_cost + p_total_cost,
      updated_at = timezone('utc', now())
  WHERE id = p_campaign_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_campaign(
  p_profile_id uuid,
  p_campaign_id uuid,
  p_total_refund integer,
  p_reason text DEFAULT 'campaign_refund',
  p_meta jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_total_refund <= 0 THEN
    RETURN;
  END IF;

  UPDATE public.profiles
  SET credits = credits + p_total_refund,
      updated_at = timezone('utc', now())
  WHERE id = p_profile_id AND deleted_at IS NULL;

  INSERT INTO public.credit_ledger (profile_id, change, reason, meta)
  VALUES (
    p_profile_id,
    p_total_refund,
    p_reason,
    coalesce(p_meta, '{}'::jsonb) || jsonb_build_object('campaign_id', p_campaign_id)
  );
END;
$$;

-- -----------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_self"
ON public.profiles
FOR SELECT
USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "profiles_update_self"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "profiles_service_role"
ON public.profiles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Credit ledger
CREATE POLICY "credit_ledger_select_self"
ON public.credit_ledger
FOR SELECT
USING (profile_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "credit_ledger_service_role"
ON public.credit_ledger
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Campaigns
CREATE POLICY "campaigns_owner_access"
ON public.campaigns
FOR ALL
USING (deleted_at IS NULL AND owner_id = auth.uid())
WITH CHECK (deleted_at IS NULL AND owner_id = auth.uid());

CREATE POLICY "campaigns_service_role"
ON public.campaigns
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Prospects
CREATE POLICY "prospects_owner_access"
ON public.prospects
FOR ALL
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.campaigns c
    WHERE c.id = public.prospects.campaign_id
      AND c.owner_id = auth.uid()
      AND c.deleted_at IS NULL
  )
)
WITH CHECK (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.campaigns c
    WHERE c.id = public.prospects.campaign_id
      AND c.owner_id = auth.uid()
      AND c.deleted_at IS NULL
  )
);

CREATE POLICY "prospects_service_role"
ON public.prospects
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Campaign events
CREATE POLICY "campaign_events_owner_access"
ON public.campaign_events
FOR SELECT
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.campaigns c
    WHERE c.id = public.campaign_events.campaign_id
      AND c.owner_id = auth.uid()
      AND c.deleted_at IS NULL
  )
);

CREATE POLICY "campaign_events_service_role"
ON public.campaign_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- -----------------------------------------------------------------------
-- Views
-- -----------------------------------------------------------------------
CREATE VIEW public.prospect_landing_view AS
SELECT
  p.id AS prospect_id,
  p.campaign_id,
  p.landing_slug,
  p.landing_page_path,
  p.pdf_path,
  p.asset_paths,
  p.vorname,
  p.nachname,
  p.anrede,
  p.stadt,
  p.qr_url,
  c.owner_id
FROM public.prospects p
JOIN public.campaigns c ON c.id = p.campaign_id
WHERE p.deleted_at IS NULL AND c.deleted_at IS NULL;

ALTER VIEW public.prospect_landing_view SET (security_invoker = true);
