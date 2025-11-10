import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CampaignStatus, Database, Json } from "@/types/database";

type N8NProspectPayload = {
  id?: string;
  company_name?: string;
  contact?: Json;
  status?: string;
  landing_page_url?: string;
  video_url?: string;
  audio_url?: string;
  presentation_url?: string;
  flyer_url?: string;
  assets?: Json;
};

export async function POST(request: Request) {
  if (!process.env.N8N_CALLBACK_SECRET) {
    return NextResponse.json({ message: "Callback-Secret fehlt" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${process.env.N8N_CALLBACK_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const supabase = createSupabaseAdminClient();
  const campaignId = payload?.campaign_id as string | undefined;

  if (!campaignId) {
    return NextResponse.json({ message: "campaign_id fehlt" }, { status: 400 });
  }

  const { data: campaignRow, error: campaignError } = await supabase
    .from("campaigns")
    .select("user_id, credits_spent, meta")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaignRow) {
    return NextResponse.json({ message: "Kampagne nicht gefunden" }, { status: 404 });
  }
  const campaignMeta = campaignRow as { user_id: string; credits_spent: number; meta: Json };
  const appendEvent = (label: string) => ({
    ...(campaignMeta.meta && typeof campaignMeta.meta === "object" ? campaignMeta.meta : {}),
    events: [
      ...getEvents(campaignMeta.meta),
      { label, at: new Date().toISOString() },
    ],
  });

  const campaignUpdate: Database["public"]["Tables"]["campaigns"]["Update"] = {};
  if (payload.status) campaignUpdate.status = payload.status as CampaignStatus;
  if (payload.prospect_count !== undefined) campaignUpdate.prospect_count = payload.prospect_count;
  if (payload.progress !== undefined) campaignUpdate.progress = payload.progress;
  if (payload.status === "review") {
    campaignUpdate.meta = appendEvent("Assets generiert");
  }

  if (Object.keys(campaignUpdate).length > 0) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Supabase admin client typing limitation
    await supabase.from("campaigns").update(campaignUpdate).eq("id", campaignId);
  }

  if (Array.isArray(payload.prospects) && payload.prospects.length > 0) {
    const records = (payload.prospects as N8NProspectPayload[]).map((prospect) => ({
      id: prospect.id ?? undefined,
      campaign_id: campaignId,
      company_name: prospect.company_name ?? null,
      contact: prospect.contact ?? {},
      status: prospect.status ?? "completed",
      landing_page_url: prospect.landing_page_url ?? null,
      video_url: prospect.video_url ?? null,
      audio_url: prospect.audio_url ?? null,
      presentation_url: prospect.presentation_url ?? null,
      flyer_url: prospect.flyer_url ?? null,
      assets: prospect.assets ?? {},
    }));

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Supabase admin client typing limitation
    await supabase.from("prospects").upsert(records, { onConflict: "id" });
  }

  if (payload.additional_credit_charge && payload.additional_credit_charge > 0) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore typed admin client limitation for RPC helper
    await supabase.rpc("deduct_credits_from_user", {
      p_user: campaignMeta.user_id,
      p_amount: payload.additional_credit_charge,
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore typed admin client limitation for RPC helper
    await supabase
      .from("campaigns")
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Supabase admin client typing limitation
      .update({
        credits_spent: (campaignMeta.credits_spent ?? 0) + payload.additional_credit_charge,
        meta: appendEvent("Zusätzliche Credits verbraucht"),
      })
      .eq("id", campaignId);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Supabase admin client typing limitation
    await supabase.from("credit_transactions").insert({
      user_id: campaignMeta.user_id,
      campaign_id: campaignId,
      amount: -payload.additional_credit_charge,
      type: "spend",
      description: "Prospect-Aufpreis",
    });
  }

  return NextResponse.json({ received: true });
}

function getEvents(meta: Json | null | undefined) {
  if (meta && typeof meta === "object" && "events" in meta) {
    const events = (meta as Record<string, unknown>).events;
    if (Array.isArray(events)) {
      return events as { label: string; at: string }[];
    }
  }
  return [] as { label: string; at: string }[];
}
