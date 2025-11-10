import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
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
    kind: "send",
    external_run_id: payload.jobId ?? null,
    status: payload.status ?? "unknown",
    response_payload: payload,
  };

  await supabase.from("n8n_job_runs").insert(jobRun);

  if (payload.status === "success") {
    await supabase
      .from("campaigns")
      .update({ status: "versandt" })
      .eq("id", campaignId);
  }

  return NextResponse.json({ ok: true });
}
