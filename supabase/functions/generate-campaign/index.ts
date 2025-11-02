/**
 * Generate Campaign Edge Function
 * Triggers n8n workflow for campaign asset generation
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[GenerateCampaign] Function called');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[GenerateCampaign] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user session
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[GenerateCampaign] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { campaignId } = await req.json();
    if (!campaignId) {
      console.error('[GenerateCampaign] Missing campaignId');
      return new Response(
        JSON.stringify({ error: 'Missing campaignId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[GenerateCampaign] Processing campaign:', campaignId);

    // Get campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, profiles!inner(*)')
      .eq('id', campaignId)
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .single();

    if (campaignError || !campaign) {
      console.error('[GenerateCampaign] Campaign not found:', campaignError);
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify campaign status
    if (campaign.status !== 'created') {
      console.error('[GenerateCampaign] Invalid campaign status:', campaign.status);
      return new Response(
        JSON.stringify({ error: `Campaign must be in 'created' status, current: ${campaign.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL_GENERATE');
    if (!n8nWebhookUrl) {
      console.error('[GenerateCampaign] N8N_WEBHOOK_URL_GENERATE not configured');
      // Update campaign status to failed
      await supabase
        .from('campaigns')
        .update({ 
          status: 'generation_failed',
          last_error: 'n8n webhook URL not configured'
        })
        .eq('id', campaignId);
      
      return new Response(
        JSON.stringify({ error: 'n8n webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get prospects for the campaign
    const { data: prospects } = await supabase
      .from('prospects')
      .select('id, ordinal, url, vorname, nachname, anrede, strasse, hausnummer, plz, stadt')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null)
      .order('ordinal', { ascending: true });

    console.log('[GenerateCampaign] Found', prospects?.length || 0, 'prospects');

    // Call n8n webhook
    console.log('[GenerateCampaign] Calling n8n webhook:', n8nWebhookUrl);
    const n8nPayload = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      servicePdfPath: campaign.service_pdf_path,
      totalProspects: campaign.total_prospects,
      prospects: prospects || [],
      supabaseUrl,
      supabaseServiceKey
    };

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(n8nPayload)
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('[GenerateCampaign] n8n webhook error:', errorText);
      
      // Update campaign status to failed
      await supabase
        .from('campaigns')
        .update({ 
          status: 'generation_failed',
          last_error: `n8n webhook failed: ${errorText}`
        })
        .eq('id', campaignId);

      // Log event
      await supabase
        .from('campaign_events')
        .insert({
          campaign_id: campaignId,
          profile_id: user.id,
          event_type: 'generation_failed',
          message: 'n8n webhook call failed',
          payload: { error: errorText }
        });

      return new Response(
        JSON.stringify({ error: 'n8n webhook call failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[GenerateCampaign] n8n webhook called successfully');

    // Log event
    await supabase
      .from('campaign_events')
      .insert({
        campaign_id: campaignId,
        profile_id: user.id,
        event_type: 'generation_started',
        message: 'Campaign generation started via n8n workflow',
        payload: { n8n_webhook: n8nWebhookUrl }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Generation workflow started',
        campaignId 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[GenerateCampaign] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

