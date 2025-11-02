#!/bin/bash

# Helper script to create .deploy-config from available information

echo "🔧 Setting up deployment configuration..."
echo ""

CONFIG_FILE=".deploy-config"

# Check if config already exists
if [ -f "$CONFIG_FILE" ]; then
  echo "⚠️  .deploy-config already exists"
  read -p "   Overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "   Keeping existing config"
    exit 0
  fi
fi

# Start with example config
cp .deploy-config.example "$CONFIG_FILE"

echo "📋 Extracting values from environment..."

# Try to extract project ref from VITE_SUPABASE_URL in frontend/.env.local
if [ -f "frontend/.env.local" ]; then
  SUPABASE_URL=$(grep "^VITE_SUPABASE_URL=" frontend/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  
  if [ -n "$SUPABASE_URL" ]; then
    # Extract project ref from URL: https://PROJECT_REF.supabase.co
    PROJECT_REF=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')
    
    if [ "$PROJECT_REF" != "$SUPABASE_URL" ]; then
      echo "   ✅ Found Supabase Project Ref from VITE_SUPABASE_URL: ${PROJECT_REF:0:8}..."
      sed -i.bak "s/^SUPABASE_PROJECT_REF=.*/SUPABASE_PROJECT_REF=$PROJECT_REF/" "$CONFIG_FILE"
      rm -f "$CONFIG_FILE.bak"
    fi
  fi
fi

echo ""
echo "✅ Created $CONFIG_FILE"
echo ""
echo "📝 Please fill in the remaining values:"
echo "   1. SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard > Project Settings > API)"
echo "   2. N8N_WEBHOOK_URL_GENERATE (from your n8n generation workflow)"
echo "   3. N8N_WEBHOOK_URL_DISPATCH (from your n8n dispatch workflow)"
echo ""
echo "   Edit: $CONFIG_FILE"
echo ""

