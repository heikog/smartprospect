import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { triggerN8nWorkflow } from "@/lib/n8n";
import { env } from "@/lib/env.server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { supabase } = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Nicht angemeldet" }, { status: 401 });
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("status")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (error || !campaign) {
    return NextResponse.json({ message: "Kampagne nicht gefunden" }, { status: 404 });
  }

  if (campaign.status !== "geprueft") {
    return NextResponse.json({ message: "Nur geprüfte Kampagnen dürfen versendet werden" }, { status: 400 });
  }

  await triggerN8nWorkflow(env.N8N_SEND_WEBHOOK_URL, {
    campaignId: id,
    callbackUrl: env.N8N_SEND_CALLBACK_URL,
  });

  return NextResponse.json({ ok: true });
}
