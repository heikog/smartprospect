#!/bin/bash

# Set Edge Function secrets in Supabase
# Requires: supabase CLI, .deploy-config file

if [ ! -f .deploy-config ]; then
  echo "❌ .deploy-config file not found"
  echo "   Copy .deploy-config.example to .deploy-config and fill in your values"
  exit 1
fi

source .deploy-config

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set in .deploy-config"
fi

if [ -z "$N8N_WEBHOOK_URL_GENERATE" ]; then
  echo "⚠️  N8N_WEBHOOK_URL_GENERATE not set in .deploy-config"
fi

if [ -z "$N8N_WEBHOOK_URL_DISPATCH" ]; then
  echo "⚠️  N8N_WEBHOOK_URL_DISPATCH not set in .deploy-config"
fi

echo "🔐 Setting Edge Function secrets..."
echo ""
echo "Note: This requires Supabase CLI v1.40.0+ with secrets management"
echo ""

if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
fi

if [ -n "$N8N_WEBHOOK_URL_GENERATE" ]; then
  echo "Setting N8N_WEBHOOK_URL_GENERATE..."
  supabase secrets set N8N_WEBHOOK_URL_GENERATE="$N8N_WEBHOOK_URL_GENERATE"
fi

if [ -n "$N8N_WEBHOOK_URL_DISPATCH" ]; then
  echo "Setting N8N_WEBHOOK_URL_DISPATCH..."
  supabase secrets set N8N_WEBHOOK_URL_DISPATCH="$N8N_WEBHOOK_URL_DISPATCH"
fi

echo ""
echo "✅ Secrets set!"
echo ""
echo "Note: If CLI doesn't support secrets, set them manually in:"
echo "   Supabase Dashboard > Project Settings > Edge Functions > Secrets"

