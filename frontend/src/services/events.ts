/**
 * Campaign events logging utilities
 * Note: Events are typically logged automatically by database triggers,
 * but we can also log them manually for explicit user actions
 */
import { supabase } from '../lib/supabase';

export interface CampaignEvent {
  campaign_id: string;
  profile_id: string;
  event_type: string;
  message?: string;
  payload?: Record<string, any>;
}

/**
 * Log a campaign event
 * This is typically called by edge functions or backend services,
 * but can be called from frontend for explicit user actions
 */
export async function logCampaignEvent(event: CampaignEvent): Promise<void> {
  console.log('[Events] Logging event:', event);

  const { error } = await supabase
    .from('campaign_events')
    .insert({
      campaign_id: event.campaign_id,
      profile_id: event.profile_id,
      event_type: event.event_type,
      message: event.message,
      payload: event.payload || {}
    });

  if (error) {
    console.error('[Events] Error logging event:', error);
    throw error;
  }

  console.log('[Events] Event logged successfully');
}

/**
 * Get events for a campaign
 */
export async function getCampaignEvents(campaignId: string) {
  console.log('[Events] Loading events for campaign:', campaignId);

  const { data, error } = await supabase
    .from('campaign_events')
    .select('*')
    .eq('campaign_id', campaignId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Events] Error loading events:', error);
    throw error;
  }

  console.log('[Events] Loaded', data?.length || 0, 'events');
  return data || [];
}

