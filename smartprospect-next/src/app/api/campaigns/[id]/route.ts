import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function DELETE(
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
    .select("user_id")
    .eq("id", params.id)
    .single();

  if (error || !campaign) {
    return NextResponse.json({ message: "Kampagne nicht gefunden" }, { status: 404 });
  }

  if (campaign.user_id !== session.user.id) {
    return NextResponse.json({ message: "Keine Berechtigung" }, { status: 403 });
  }

  // Clean storage folders best-effort
  const prefix = `${session.user.id}/${params.id}`;
  const removeAll = async (bucket: "campaign-uploads" | "generated-assets") => {
    const list = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
    if (!list.error && list.data.length > 0) {
      await supabase.storage
        .from(bucket)
        .remove(list.data.map((item) => `${prefix}/${item.name}`));
    }
  };

  await Promise.all([removeAll("campaign-uploads"), removeAll("generated-assets")]);

  const { error: deleteError } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", params.id);

  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
