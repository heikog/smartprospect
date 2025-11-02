#!/bin/bash

# Deploy Supabase Edge Functions
# Configuration: Load from .deploy-config if it exists

# Load config if available
if [ -f .deploy-config ]; then
  source .deploy-config
  echo "📋 Loaded configuration from .deploy-config"
  
  if [ -n "$SUPABASE_PROJECT_REF" ]; then
    echo "   Project Ref: ${SUPABASE_PROJECT_REF:0:8}..."
  fi
fi

# Check if logged in
if ! supabase projects list &>/dev/null; then
  echo "⚠️  Not logged in to Supabase CLI"
  echo "   Run: supabase login"
  exit 1
fi

# Check if project is linked
if [ -n "$SUPABASE_PROJECT_REF" ]; then
  echo ""
  echo "🔗 Linking to project: $SUPABASE_PROJECT_REF"
  supabase link --project-ref "$SUPABASE_PROJECT_REF" || echo "   (Project may already be linked)"
fi

echo ""
echo "🚀 Deploying Supabase Edge Functions..."

echo ""
echo "Deploying generate-campaign..."
supabase functions deploy generate-campaign

echo ""
echo "Deploying approve-campaign..."
supabase functions deploy approve-campaign

echo ""
echo "Deploying dispatch-campaign..."
supabase functions deploy dispatch-campaign

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  Don't forget to set environment variables in Supabase Dashboard:"
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "   ✅ SUPABASE_SERVICE_ROLE_KEY (found in config)"
else
  echo "   ⚠️  SUPABASE_SERVICE_ROLE_KEY"
fi
if [ -n "$N8N_WEBHOOK_URL_GENERATE" ]; then
  echo "   ✅ N8N_WEBHOOK_URL_GENERATE (found in config)"
else
  echo "   ⚠️  N8N_WEBHOOK_URL_GENERATE"
fi
if [ -n "$N8N_WEBHOOK_URL_DISPATCH" ]; then
  echo "   ✅ N8N_WEBHOOK_URL_DISPATCH (found in config)"
else
  echo "   ⚠️  N8N_WEBHOOK_URL_DISPATCH"
fi
echo ""
echo "Go to: Project Settings > Edge Functions > Secrets"
echo ""
echo "To set secrets from config file, run:"
echo "  ./set-edge-function-secrets.sh"

