import { supabase } from '../lib/supabase';
import { env } from '../lib/env';
import type { Database } from '../types/database';

export type CampaignRecord = Database['public']['Tables']['campaigns']['Row'];
export type ProspectRecord = Database['public']['Tables']['prospects']['Row'];

const fallbackOwnerId = env.demoOwnerId ?? '00000000-0000-0000-0000-000000000000';

export async function listCampaigns(ownerId = fallbackOwnerId) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('owner_id', ownerId)
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
  ownerId?: string;
}) {
  const ownerId = input.ownerId ?? fallbackOwnerId;
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name: input.name,
      owner_id: ownerId,
      service_pdf_path: input.servicePdfPath,
      total_prospects: input.totalProspects,
      status: 'created'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
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
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}
