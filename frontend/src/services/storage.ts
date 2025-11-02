/**
 * Supabase Storage utilities for file uploads
 */
import { supabase } from '../lib/supabase';

const STORAGE_BUCKET = 'campaigns';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  path: string;
  publicUrl: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file File to upload
 * @param storagePath Path in storage bucket (e.g., 'inputs/campaign-123/service.pdf')
 * @returns Upload result with path and public URL
 */
export async function uploadFile(file: File, storagePath: string): Promise<UploadResult> {
  console.log('[Storage] Uploading file:', file.name, 'to path:', storagePath);
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Upload file
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('[Storage] Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  console.log('[Storage] File uploaded successfully:', data.path);

  return {
    path: data.path,
    publicUrl: urlData.publicUrl
  };
}

/**
 * Get a signed URL for file access
 * @param filePath Path to file in storage
 * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL
 */
export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('[Storage] Error creating signed URL:', error);
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

