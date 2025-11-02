/**
 * Approve Campaign Edge Function
 * Handles campaign approval workflow
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
    console.log('[ApproveCampaign] Function called');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[ApproveCampaign] No authorization header');
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
      console.error('[ApproveCampaign] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { campaignId } = await req.json();
    if (!campaignId) {
      console.error('[ApproveCampaign] Missing campaignId');
      return new Response(
        JSON.stringify({ error: 'Missing campaignId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[ApproveCampaign] Processing campaign:', campaignId);

    // Get campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .single();

    if (campaignError || !campaign) {
      console.error('[ApproveCampaign] Campaign not found:', campaignError);
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify campaign status
    const validStatuses = ['generated', 'ready_for_review'];
    if (!validStatuses.includes(campaign.status)) {
      console.error('[ApproveCampaign] Invalid campaign status:', campaign.status);
      return new Response(
        JSON.stringify({ error: `Campaign must be in 'generated' or 'ready_for_review' status, current: ${campaign.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update campaign status to approved
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('[ApproveCampaign] Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update campaign' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log event
    await supabase
      .from('campaign_events')
      .insert({
        campaign_id: campaignId,
        profile_id: user.id,
        event_type: 'campaign_approved',
        message: 'Campaign approved by user',
        payload: {}
      });

    console.log('[ApproveCampaign] Campaign approved successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Campaign approved',
        campaignId 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[ApproveCampaign] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

