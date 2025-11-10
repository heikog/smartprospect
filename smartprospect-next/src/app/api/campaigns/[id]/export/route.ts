import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(
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

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single();

  if (!campaign) {
    return NextResponse.json({ message: "Kampagne nicht gefunden" }, { status: 404 });
  }

  const { data: prospects } = await supabase
    .from("prospects")
    .select("company_name, contact, landing_page_url, video_url, audio_url, presentation_url, flyer_url")
    .eq("campaign_id", params.id);

  const rows = [
    [
      "Company",
      "Name",
      "E-Mail",
      "Landingpage",
      "Video",
      "Audio",
      "Präsentation",
      "Flyer",
    ],
    ...((prospects ?? []).map((prospect) => {
      const contact = (prospect.contact as Record<string, string>) ?? {};
      return [
        prospect.company_name ?? "",
        contact.name ?? "",
        contact.email ?? "",
        prospect.landing_page_url ?? "",
        prospect.video_url ?? "",
        prospect.audio_url ?? "",
        prospect.presentation_url ?? "",
        prospect.flyer_url ?? "",
      ];
    })),
  ];

  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=campaign-export.csv",
    },
  });
}
