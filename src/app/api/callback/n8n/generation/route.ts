import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env.server";
import type { Json, TablesInsert } from "@/types/database";

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
      const updatePromises = payload.prospects.map(async (prospect: Record<string, unknown>, index: number) => {
        const prospectId = typeof prospect.prospect_id === "string" ? prospect.prospect_id : null;
        const rowIndex = typeof prospect.row_index === "number" ? prospect.row_index : index + 1;
        const updateData: Partial<TablesInsert<"campaign_prospects">> = {
          company_url: prospect.company_url ? String(prospect.company_url) : undefined,
          anrede: prospect.anrede ? String(prospect.anrede) : undefined,
          vorname: prospect.vorname ? String(prospect.vorname) : undefined,
          nachname: prospect.nachname ? String(prospect.nachname) : undefined,
          strasse: prospect.strasse ? String(prospect.strasse) : undefined,
          hausnummer: prospect.hausnummer ? String(prospect.hausnummer) : undefined,
          plz: prospect.plz ? String(prospect.plz) : undefined,
          ort: prospect.ort ? String(prospect.ort) : undefined,
          qr_code_path: prospect.qr_code_path ? String(prospect.qr_code_path) : undefined,
          flyer_pdf_path: prospect.flyer_pdf_path ? String(prospect.flyer_pdf_path) : undefined,
          landingpage_path: prospect.landingpage_path ? String(prospect.landingpage_path) : undefined,
          slides_url: prospect.slides_url ? String(prospect.slides_url) : undefined,
          video_url: prospect.video_url ? String(prospect.video_url) : undefined,
          error_log: (prospect.error_log as Json | null) ?? undefined,
          is_valid: typeof prospect.is_valid === "boolean" ? prospect.is_valid : undefined,
          tracking_token: prospect.tracking_token ? String(prospect.tracking_token) : undefined,
        };

        const cleanedUpdate = Object.fromEntries(
          Object.entries(updateData).filter(([, value]) => value !== undefined),
        );

        if (Object.keys(cleanedUpdate).length === 0) {
          return;
        }

        let query = supabase.from("campaign_prospects").update(cleanedUpdate).eq("campaign_id", campaignId);
        if (prospectId) {
          query = query.eq("id", prospectId);
        } else {
          query = query.eq("row_index", rowIndex);
        }

        await query;
      });

      await Promise.all(updatePromises);
    }
  }

  return NextResponse.json({ ok: true });
}
