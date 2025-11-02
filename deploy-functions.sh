#!/bin/bash

# Deploy Supabase Edge Functions
# Make sure you're logged in: supabase login
# Make sure project is linked: supabase link --project-ref YOUR_PROJECT_REF

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
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - N8N_WEBHOOK_URL_GENERATE"
echo "   - N8N_WEBHOOK_URL_DISPATCH"
echo ""
echo "Go to: Project Settings > Edge Functions > Secrets"

