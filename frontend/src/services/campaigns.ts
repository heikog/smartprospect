import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { uploadFile } from './storage';
import { parseExcelFile } from './excel';

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
  excelFile: File;
  pdfFile: File;
  ownerId: string;
}) {
  console.log('[Campaigns] Creating campaign:', input.name);

  // Step 1: Parse Excel file to get prospect data
  console.log('[Campaigns] Parsing Excel file...');
  const prospectRows = await parseExcelFile(input.excelFile);
  const totalProspects = prospectRows.length;

  if (totalProspects === 0) {
    throw new Error('No valid prospects found in Excel file');
  }

  // Step 2: Create campaign first (this will deduct credits)
  console.log('[Campaigns] Creating campaign record...');
  const { data: campaignData, error: campaignError } = await supabase.rpc('create_campaign_with_cost', {
    p_owner_id: input.ownerId,
    p_name: input.name,
    p_service_pdf_path: '', // Will be updated after upload
    p_total_prospects: totalProspects
  });

  if (campaignError) {
    console.error('[Campaigns] Error creating campaign:', campaignError);
    throw campaignError;
  }

  const campaign = campaignData as CampaignRecord;
  console.log('[Campaigns] Campaign created:', campaign.id);

  try {
    // Step 3: Upload files to storage
    console.log('[Campaigns] Uploading files to storage...');
    const pdfPath = `inputs/${campaign.id}/service.pdf`;
    const excelPath = `inputs/${campaign.id}/prospects.xlsx`;

    const [pdfResult, excelResult] = await Promise.all([
      uploadFile(input.pdfFile, pdfPath),
      uploadFile(input.excelFile, excelPath)
    ]);

    console.log('[Campaigns] Files uploaded successfully');

    // Step 4: Update campaign with PDF path
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ service_pdf_path: pdfResult.path })
      .eq('id', campaign.id);

    if (updateError) {
      console.error('[Campaigns] Error updating campaign with PDF path:', updateError);
      throw updateError;
    }

    // Step 5: Create prospect records
    console.log('[Campaigns] Creating prospect records...');
    const prospectRecords = prospectRows.map((row, index) => ({
      campaign_id: campaign.id,
      ordinal: index,
      url: row.url,
      anrede: row.anrede,
      vorname: row.vorname,
      nachname: row.nachname,
      strasse: row.strasse,
      hausnummer: row.hausnummer,
      plz: row.plz,
      stadt: row.stadt
    }));

    const { error: prospectsError } = await supabase
      .from('prospects')
      .insert(prospectRecords);

    if (prospectsError) {
      console.error('[Campaigns] Error creating prospects:', prospectsError);
      throw prospectsError;
    }

    console.log('[Campaigns] Campaign created successfully with', totalProspects, 'prospects');

    // Return updated campaign
    const { data: updatedCampaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign.id)
      .single();

    if (fetchError) {
      console.error('[Campaigns] Error fetching updated campaign:', fetchError);
      return campaign; // Return original if fetch fails
    }

    return updatedCampaign as CampaignRecord;
  } catch (error) {
    // If something fails after campaign creation, we should probably delete it
    // But credits are already deducted, so maybe we keep it with an error status?
    console.error('[Campaigns] Error in campaign creation flow:', error);
    throw error;
  }
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
