import { z } from "zod";

export const prospectSchema = z.object({
  prospect_id: z.string().uuid().optional(),
  row_index: z.coerce.number().int().positive().optional(),
  company_url: z.string().min(1),
  anrede: z.string().optional().default(""),
  vorname: z.string().optional().default(""),
  nachname: z.string().optional().default(""),
  strasse: z.string().optional().default(""),
  hausnummer: z.string().optional().default(""),
  plz: z.string().optional().default(""),
  ort: z.string().optional().default(""),
  qr_code_path: z.string().url().nullable().optional(),
  flyer_pdf_path: z.string().url().nullable().optional(),
  landingpage_path: z.string().url().nullable().optional(),
  slides_url: z.string().url().nullable().optional(),
  video_url: z.string().url().nullable().optional(),
  flyer_storage_path: z.string().optional(),
  slides_storage_path: z.string().optional(),
  video_storage_path: z.string().optional(),
  error_log: z.unknown().nullable().optional(),
  is_valid: z.boolean().optional().default(true),
  tracking_token: z.string().uuid().nullable().optional(),
});

export const n8nGenerationPayloadSchema = z.object({
  campaignId: z.string().uuid(),
  status: z.enum(["success", "error"]),
  jobId: z.string().optional(),
  prospects: z.array(prospectSchema).optional(),
});

export const n8nSendPayloadSchema = z.object({
  campaignId: z.string().uuid(),
  status: z.enum(["success", "error"]),
  jobId: z.string().optional(),
});
