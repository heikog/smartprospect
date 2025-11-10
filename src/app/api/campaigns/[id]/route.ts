import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { deleteStorageObjects } from "@/lib/storage";

export async function GET(
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
    .select("*, campaign_prospects(*)")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (error || !campaign) {
    return NextResponse.json({ message: "Kampagne nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

export async function DELETE(
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
    .select("source_excel_path, service_pdf_path")
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (error || !campaign) {
    return NextResponse.json({ message: "Kampagne nicht gefunden" }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("campaigns")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 400 });
  }

  await deleteStorageObjects(
    [campaign.source_excel_path, campaign.service_pdf_path].filter(Boolean) as string[],
  );

  return NextResponse.json({ success: true });
}
