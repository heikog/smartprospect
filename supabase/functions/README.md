# Supabase Edge Functions

This directory contains Supabase Edge Functions for campaign operations and n8n integration.

## Available Functions

### `generate-campaign`
Triggers the n8n workflow for campaign asset generation.

**Endpoint:** `POST /functions/v1/generate-campaign`

**Request Body:**
```json
{
  "campaignId": "uuid"
}
```

**Note:** This function should call the n8n webhook URL configured in environment variables.

### `approve-campaign`
Handles campaign approval workflow.

**Endpoint:** `POST /functions/v1/approve-campaign`

**Request Body:**
```json
{
  "campaignId": "uuid"
}
```

### `dispatch-campaign`
Triggers the n8n workflow for campaign dispatch.

**Endpoint:** `POST /functions/v1/dispatch-campaign`

**Request Body:**
```json
{
  "campaignId": "uuid"
}
```

## Setup

These functions need to be deployed to Supabase. Use the Supabase CLI:

```bash
supabase functions deploy generate-campaign
supabase functions deploy approve-campaign
supabase functions deploy dispatch-campaign
```

## Environment Variables

Set these in Supabase Dashboard > Project Settings > Edge Functions:

- `N8N_WEBHOOK_URL_GENERATE`: n8n webhook URL for generation workflow
- `N8N_WEBHOOK_URL_DISPATCH`: n8n webhook URL for dispatch workflow
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for Supabase operations

## Implementation Status

✅ **Edge functions implemented** - All three edge functions have been created:
- `generate-campaign/index.ts` - Triggers n8n generation workflow
- `approve-campaign/index.ts` - Handles campaign approval
- `dispatch-campaign/index.ts` - Triggers n8n dispatch workflow

## Deployment

Deploy the functions using Supabase CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (or use: supabase link --project-ref your-project-ref)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
supabase functions deploy generate-campaign
supabase functions deploy approve-campaign
supabase functions deploy dispatch-campaign
```

Or deploy individually from the supabase dashboard.

## Environment Variables

Set these in Supabase Dashboard > Project Settings > Edge Functions > Secrets:

- `SUPABASE_URL`: Your Supabase project URL (automatically set)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for Supabase operations
- `N8N_WEBHOOK_URL_GENERATE`: n8n webhook URL for generation workflow
- `N8N_WEBHOOK_URL_DISPATCH`: n8n webhook URL for dispatch workflow

