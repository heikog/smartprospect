#!/bin/bash

# Deploy all Supabase Edge Functions required for Smart Prospect
# Reads configuration from .env.local (SUPABASE_URL, optional SUPABASE_DB_PASSWORD)

set -euo pipefail

FUNCTIONS=(
  create-checkout-session
  stripe-webhook
  generate-campaign
  approve-campaign
  dispatch-campaign
)

if [ ! -f .env.local ]; then
  echo "❌  .env.local not found. Bitte lege sie im Projektroot an und trage zumindest SUPABASE_URL ein."
  exit 1
fi

set -a
source .env.local
set +a

SUPABASE_URL_ENV="${SUPABASE_URL:-${VITE_SUPABASE_URL:-}}"
if [ -z "$SUPABASE_URL_ENV" ]; then
  echo "❌  SUPABASE_URL (oder VITE_SUPABASE_URL) fehlt in .env.local"
  exit 1
fi

PROJECT_REF="$(echo "$SUPABASE_URL_ENV" | sed -E 's#https?://##; s#\.supabase\.co.*##')"

if ! [[ "$PROJECT_REF" =~ ^[a-z0-9]{1,32}$ ]]; then
  echo "❌  Konnte Project Ref nicht aus SUPABASE_URL ableiten. Gefunden: '$PROJECT_REF'"
  echo "    Erwartet wird z. B. 'abcdefghijklmnopqrst'"
  exit 1
fi

if ! supabase projects list &>/dev/null; then
  echo "⚠️  Not logged in to Supabase CLI."
  echo "   Run: supabase login"
  exit 1
fi

echo "🔗 Linking Supabase project (${PROJECT_REF}) ..."
LINK_ARGS=(--project-ref "$PROJECT_REF")
if [ -n "${SUPABASE_DB_PASSWORD:-}" ]; then
  LINK_ARGS+=(--password "$SUPABASE_DB_PASSWORD")
fi
if ! supabase link "${LINK_ARGS[@]}" >/dev/null 2>&1; then
  echo "   (Linking skipped oder bereits verknüpft – weiter mit Deploy)"
fi

echo "🚀 Deploying Supabase Edge Functions..."
for fn in "${FUNCTIONS[@]}"; do
  echo ""
  echo "Deploying ${fn}..."
  supabase functions deploy "${fn}"
done

echo ""
echo "✅ Deployment complete!"
echo "Stelle sicher, dass alle benötigten Secrets in Supabase gesetzt sind (Dashboard → Project Settings → Edge Functions → Secrets)."
