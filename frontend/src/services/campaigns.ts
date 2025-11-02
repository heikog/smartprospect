import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type CampaignRecord = Database['public']['Tables']['campaigns']['Row'];
export type ProspectRecord = Database['public']['Tables']['prospects']['Row'];

export async function listCampaigns(ownerId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('owner_id', ownerId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createCampaign(input: {
  name: string;
  servicePdfPath: string;
  totalProspects: number;
  ownerId: string;
}) {
  const { data, error } = await supabase.rpc('create_campaign_with_cost', {
    p_owner_id: input.ownerId,
    p_name: input.name,
    p_service_pdf_path: input.servicePdfPath,
    p_total_prospects: input.totalProspects
  });

  if (error) {
    throw error;
  }

  return data as CampaignRecord;
}

export async function updateCampaignStatus(params: {
  campaignId: string;
  status: CampaignRecord['status'];
  fields?: Partial<CampaignRecord>;
}) {
  const { data, error } = await supabase
    .from('campaigns')
    .update({
      status: params.status,
      ...params.fields,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.campaignId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listProspects(campaignId: string) {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('campaign_id', campaignId)
    .is('deleted_at', null)
    .order('ordinal', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getProspect(campaignId: string, prospectId: string) {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('id', prospectId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}
