import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseRouteClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: "Nicht angemeldet" }, { status: 401 });
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !campaign) {
    return NextResponse.json({ message: "Kampagne nicht gefunden" }, { status: 404 });
  }

  if (campaign.user_id !== session.user.id) {
    return NextResponse.json({ message: "Keine Berechtigung" }, { status: 403 });
  }

  if (!process.env.NBM_WEBHOOK_URL_DISPATCH) {
    return NextResponse.json({ message: "Dispatch-Webhook nicht konfiguriert" }, { status: 500 });
  }

  await fetch(process.env.NBM_WEBHOOK_URL_DISPATCH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      campaign_id: campaign.id,
      user_id: session.user.id,
      name: campaign.name,
    }),
  }).catch((err) => console.error("dispatch webhook", err));

  await supabase
    .from("campaigns")
    .update({ status: "sent" })
    .eq("id", campaign.id);

  return NextResponse.json({ success: true });
}
