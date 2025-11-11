import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env.server";
import type { TablesInsert } from "@/types/database";

function verifySecret(request: NextRequest) {
  if (!env.N8N_SHARED_SECRET) return true;
  const headerValue = request.headers.get(env.N8N_AUTH_HEADER.toLowerCase()) ?? request.headers.get(env.N8N_AUTH_HEADER);
  return headerValue === env.N8N_SHARED_SECRET;
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const campaignId = payload.campaignId as string | undefined;
  if (!campaignId) {
    return NextResponse.json({ message: "campaignId fehlt" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const jobRun: TablesInsert<"n8n_job_runs"> = {
    campaign_id: campaignId,
    kind: "generation",
    external_run_id: payload.jobId ?? null,
    status: payload.status ?? "unknown",
    response_payload: payload,
  };

  await supabase.from("n8n_job_runs").insert([jobRun]);

  if (payload.status === "success") {
    await supabase
      .from("campaigns")
      .update({ status: "bereit_zur_pruefung" })
      .eq("id", campaignId);

    if (Array.isArray(payload.prospects) && payload.prospects.length) {
      const rows = payload.prospects.map((prospect: Record<string, unknown>, index: number) => ({
        campaign_id: campaignId,
        row_index: Number(prospect.row_index ?? index + 1),
        company_url: String(prospect.company_url ?? ""),
        anrede: String(prospect.anrede ?? ""),
        vorname: String(prospect.vorname ?? ""),
        nachname: String(prospect.nachname ?? ""),
        strasse: String(prospect.strasse ?? ""),
        hausnummer: String(prospect.hausnummer ?? ""),
        plz: String(prospect.plz ?? ""),
        ort: String(prospect.ort ?? ""),
        qr_code_path: prospect.qr_code_path ? String(prospect.qr_code_path) : null,
        flyer_pdf_path: prospect.flyer_pdf_path ? String(prospect.flyer_pdf_path) : null,
        landingpage_path: prospect.landingpage_path ? String(prospect.landingpage_path) : null,
        error_log: prospect.error_log ?? null,
        is_valid: prospect.is_valid ?? true,
        tracking_token: prospect.tracking_token ? String(prospect.tracking_token) : randomUUID(),
      } as TablesInsert<"campaign_prospects">));

      await supabase.from("campaign_prospects").upsert(rows, { onConflict: "campaign_id,row_index" });
    }
  }

  return NextResponse.json({ ok: true });
}
