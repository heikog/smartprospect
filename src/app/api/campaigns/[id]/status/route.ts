import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import type { CampaignStatus } from "@/types/database";

const allowedStatuses: CampaignStatus[] = ["geprueft"];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { supabase } = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const nextStatus = body.status as CampaignStatus | undefined;

  if (!nextStatus || !allowedStatuses.includes(nextStatus)) {
    return NextResponse.json({ message: "Ungültiger Status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("campaigns")
    .update({ status: nextStatus })
    .eq("user_id", user.id)
    .eq("id", params.id)
    .select()
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ message: error?.message ?? "Kampagne nicht gefunden" }, { status: 400 });
  }

  return NextResponse.json({ campaign: data });
}
