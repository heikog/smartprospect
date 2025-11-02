/**
 * Edge Functions API client for campaign operations
 * These functions call Supabase Edge Functions which handle n8n integration
 */
import { supabase } from '../lib/supabase';
import { env } from '../lib/env';

const EDGE_FUNCTION_BASE = `${env.supabaseUrl}/functions/v1`;

async function callEdgeFunction(
  functionName: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
  } = {}
): Promise<any> {
  const session = await supabase.auth.getSession();
  
  if (!session.data.session) {
    throw new Error('No active session');
  }

  const { method = 'POST', body } = options;
  
  const url = `${EDGE_FUNCTION_BASE}/${functionName}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.data.session.access_token}`
  };

  console.log(`[API] Calling ${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API] Edge function error (${response.status}):`, errorText);
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`[API] Edge function response:`, data);
  return data;
}

/**
 * Start campaign generation (triggers n8n workflow)
 */
export async function startCampaignGeneration(campaignId: string): Promise<void> {
  return callEdgeFunction('generate-campaign', {
    method: 'POST',
    body: { campaignId }
  });
}

/**
 * Approve campaign
 */
export async function approveCampaign(campaignId: string): Promise<void> {
  return callEdgeFunction('approve-campaign', {
    method: 'POST',
    body: { campaignId }
  });
}

/**
 * Dispatch campaign (triggers n8n dispatch workflow)
 */
export async function dispatchCampaign(campaignId: string): Promise<void> {
  return callEdgeFunction('dispatch-campaign', {
    method: 'POST',
    body: { campaignId }
  });
}

