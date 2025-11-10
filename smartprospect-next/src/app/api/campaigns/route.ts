import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

const BASE_CAMPAIGN_COST = 50;

export async function POST(request: Request) {
  const supabase = createSupabaseRouteClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json();
  const { campaignId, name, excelPath, pdfPath } = body as {
    campaignId?: string;
    name?: string;
    excelPath?: string;
    pdfPath?: string;
  };

  if (!campaignId || !name || !excelPath || !pdfPath) {
    return NextResponse.json({ message: "Ungültige Eingaben" }, { status: 400 });
  }

  const spend = await supabase.rpc("spend_credits", { p_amount: BASE_CAMPAIGN_COST });
  if (spend.error) {
    return NextResponse.json(
      { message: spend.error.message || "Nicht genügend Credits" },
      { status: 400 },
    );
  }

  const initialEvents = [
    {
      label: "Kampagne angelegt",
      at: new Date().toISOString(),
    },
  ];

  const insert = await supabase
    .from("campaigns")
    .insert({
      id: campaignId,
      user_id: session.user.id,
      name,
      excel_path: excelPath,
      pdf_path: pdfPath,
      status: "generating",
      credits_spent: BASE_CAMPAIGN_COST,
      meta: { events: initialEvents },
    })
    .select()
    .single();

  if (insert.error || !insert.data) {
    return NextResponse.json(
      { message: insert.error?.message ?? "Kampagne konnte nicht gespeichert werden" },
      { status: 400 },
    );
  }

  await supabase.from("credit_transactions").insert({
    user_id: session.user.id,
    campaign_id: insert.data.id,
    amount: -BASE_CAMPAIGN_COST,
    type: "spend",
    description: `Kampagne ${name}`,
  });

  const excelSigned = await supabase.storage
    .from("campaign-uploads")
    .createSignedUrl(excelPath, 60 * 60);
  const pdfSigned = await supabase.storage
    .from("campaign-uploads")
    .createSignedUrl(pdfPath, 60 * 60);

  if (excelSigned.error || pdfSigned.error) {
    return NextResponse.json(
      { message: "Upload konnte nicht signiert werden" },
      { status: 500 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  if (process.env.NBM_WEBHOOK_URL_GENERATE) {
    await fetch(process.env.NBM_WEBHOOK_URL_GENERATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaign_id: insert.data.id,
        user_id: session.user.id,
        campaign_name: name,
        files: {
          excel_signed_url: excelSigned.data.signedUrl,
          pdf_signed_url: pdfSigned.data.signedUrl,
        },
        callback: {
          url: `${siteUrl}/api/webhooks/n8n`,
          secret: process.env.N8N_CALLBACK_SECRET,
        },
      }),
    }).catch((error) => console.error("n8n webhook error", error));
  }

  return NextResponse.json({ campaign: insert.data });
}
