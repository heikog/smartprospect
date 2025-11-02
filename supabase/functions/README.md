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

⚠️ **Placeholder functions needed** - The actual edge function implementations need to be created. The frontend is already configured to call these endpoints.

