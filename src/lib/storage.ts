import { env } from "@/lib/env.server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const PUBLIC_STORAGE_BASE = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public` as const;

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export type StorageUploadResult = {
  bucket: string;
  path: string;
  publicUrl: string;
};

export async function uploadCampaignAsset(params: {
  campaignId: string;
  folder: "excel" | "service-pdf" | "assets";
  buffer: Buffer;
  filename: string;
  contentType?: string;
}): Promise<StorageUploadResult> {
  const { campaignId, folder, buffer, filename, contentType } = params;
  const bucket = env.SUPABASE_STORAGE_BUCKET_UPLOADS;
  const supabase = getSupabaseAdminClient();
  const cleanedName = sanitizeFilename(filename || `${folder}.bin`);
  const path = `campaigns/${campaignId}/${folder}-${Date.now()}-${cleanedName}`;

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    cacheControl: "3600",
    upsert: false,
    contentType,
  });

  if (error) {
    throw new Error(`Failed to upload ${folder} file: ${error.message}`);
  }

  return {
    bucket,
    path,
    publicUrl: `${PUBLIC_STORAGE_BASE}/${bucket}/${path}`,
  };
}

export async function deleteStorageObjects(paths: string[]) {
  if (!paths.length) return;
  const supabase = getSupabaseAdminClient();
  await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET_UPLOADS).remove(paths);
}

export function getPublicStorageUrl(path: string, bucket = env.SUPABASE_STORAGE_BUCKET_UPLOADS) {
  return `${PUBLIC_STORAGE_BASE}/${bucket}/${path}`;
}
