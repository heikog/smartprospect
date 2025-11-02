# Deployment Configuration Guide

To deploy the edge functions without placeholders, please provide the following information:

## Required Information

### 1. Supabase Project Reference ID
**Where to find it:**
- Option A: In your Supabase Dashboard URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`
- Option B: From your `VITE_SUPABASE_URL` environment variable: `https://YOUR_PROJECT_REF.supabase.co`

**Example:** If your Supabase URL is `https://abcdefghijklmnop.supabase.co`, then `abcdefghijklmnop` is your project reference ID.

### 2. Supabase Service Role Key
**Where to find it:**
- Go to: Supabase Dashboard > **Project Settings** > **API**
- Look for the **service_role** key (NOT the anon key)
- ⚠️ **Keep this secret** - never commit it to git or expose it publicly

**Format:** Usually starts with `eyJ...` (JWT token)

### 3. n8n Webhook URLs

#### Generation Workflow Webhook URL
- In your n8n workflow for campaign generation, add a **Webhook** node
- Configure it to receive POST requests
- Copy the webhook URL (usually looks like: `https://your-n8n-instance.com/webhook/generate`)

#### Dispatch Workflow Webhook URL
- In your n8n workflow for campaign dispatch, add a **Webhook** node  
- Configure it to receive POST requests
- Copy the webhook URL (usually looks like: `https://your-n8n-instance.com/webhook/dispatch`)

## How to Provide This Information

Once you have all the information above, I can:

1. **Update the deployment scripts** with your actual project reference ID
2. **Create a configuration file** (gitignored) with your values
3. **Update documentation** to remove all placeholders

Or, you can provide the values and I'll create a setup script that uses them automatically.

## What I Need From You

Please provide:
- ✅ Your Supabase Project Reference ID (from dashboard URL or Supabase URL)
- ✅ Your Supabase Service Role Key (from Project Settings > API)
- ✅ Your n8n Generation Webhook URL (or say "not set up yet")
- ✅ Your n8n Dispatch Webhook URL (or say "not set up yet")

Once you provide these, I'll:
1. Extract the project ref from your Supabase URL (if you have VITE_SUPABASE_URL)
2. Update all deployment scripts and documentation
3. Create configuration files (gitignored for secrets)
4. Make deployment fully automated

## Quick Setup

If you want to fill it in yourself:

1. Copy the example config:
   ```bash
   cp .deploy-config.example .deploy-config
   ```

2. Edit `.deploy-config` with your values

3. Run the deployment script (it will read from the config)

