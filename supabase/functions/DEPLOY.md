# Deploying Edge Functions

## Option 1: Using Supabase CLI (Recommended)

### Step 1: Login to Supabase
```bash
supabase login
```
This will open a browser window for authentication.

### Step 2: Link to Your Project
```bash
# If you know your project reference ID:
supabase link --project-ref YOUR_PROJECT_REF

# Or list your projects and select one:
supabase projects list
# Then use the project ref from the list
```

### Step 3: Deploy Functions
```bash
# Deploy all three functions
supabase functions deploy generate-campaign
supabase functions deploy approve-campaign
supabase functions deploy dispatch-campaign
```

### Step 4: Set Environment Variables
After deployment, set these secrets in Supabase Dashboard:
- Go to: **Project Settings** > **Edge Functions** > **Secrets**
- Add the following secrets:

| Secret Name | Value |
|------------|-------|
| `SUPABASE_URL` | Your Supabase project URL (usually auto-set) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from Project Settings > API |
| `N8N_WEBHOOK_URL_GENERATE` | Your n8n webhook URL for generation workflow |
| `N8N_WEBHOOK_URL_DISPATCH` | Your n8n webhook URL for dispatch workflow |

## Option 2: Using Supabase Dashboard

1. Go to **Edge Functions** in your Supabase Dashboard
2. For each function (`generate-campaign`, `approve-campaign`, `dispatch-campaign`):
   - Click **"Deploy new function"**
   - Upload the function folder as a ZIP file (zip the `index.ts` file)
   - Set the function name
   - Add environment variables/secrets as listed above

## Verify Deployment

After deployment, you can test the functions:

```bash
# Test generate-campaign (replace with your tokens and campaign ID)
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-campaign' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"campaignId": "YOUR_CAMPAIGN_ID"}'
```

## Troubleshooting

- **Function not found**: Make sure the function name matches exactly (case-sensitive)
- **401 Unauthorized**: Check that your access token is valid
- **n8n webhook URL not configured**: Set the `N8N_WEBHOOK_URL_GENERATE` and `N8N_WEBHOOK_URL_DISPATCH` secrets
- **Campaign not found**: Verify the campaign ID and that the user owns the campaign

## Notes

- Edge Functions use Deno runtime
- Functions are deployed to: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/FUNCTION_NAME`
- All functions require authentication via Bearer token
- CORS headers are included for browser requests

