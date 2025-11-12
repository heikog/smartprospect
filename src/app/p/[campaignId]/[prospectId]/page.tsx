import { notFound } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProspectLandingPage({
  params,
  searchParams,
}: {
  params: { campaignId: string; prospectId: string };
  searchParams: { t?: string };
}) {
  const token = searchParams.t;
  if (!token) {
    notFound();
  }

  const supabase = getSupabaseAdminClient();
  const { data: prospect } = await supabase
    .from("campaign_prospects")
    .select("*, campaigns(name)")
    .eq("campaign_id", params.campaignId)
    .eq("id", params.prospectId)
    .eq("tracking_token", token)
    .maybeSingle();

  if (!prospect) {
    notFound();
  }

  const typedProspect = prospect as Tables<"campaign_prospects"> & {
    campaigns: Pick<Tables<"campaigns">, "name"> | null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Smart Prospect</p>
        <h1 className="text-4xl font-semibold">
          Hallo {typedProspect.anrede} {typedProspect.vorname} {typedProspect.nachname}
        </h1>
        <p className="text-lg text-slate-200">
          Wir haben eine individuelle Begrüßung für {typedProspect.company_url} vorbereitet. Der Flyer in Ihrem Paket
          führt direkt hierher und verbindet Offline &amp; Online Journey.
        </p>
        <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
          <p className="text-sm text-indigo-200">Kampagne</p>
          <p className="text-2xl font-semibold text-white">{typedProspect.campaigns?.name}</p>
          <p className="mt-2 text-slate-100">
            Lieferadresse: {typedProspect.strasse} {typedProspect.hausnummer}, {typedProspect.plz} {typedProspect.ort}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={typedProspect.company_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-white px-6 py-3 text-slate-900"
          >
            Mehr über uns
          </a>
        {typedProspect.flyer_pdf_path && (
          <a
            href={typedProspect.flyer_pdf_path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-white/40 px-6 py-3"
          >
            Flyer als PDF
          </a>
        )}
        {typedProspect.slides_url && (
          <a
            href={typedProspect.slides_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-white/40 px-6 py-3"
          >
            Präsentation ansehen
          </a>
        )}
        </div>
        {typedProspect.video_url && (
          <div className="mt-8 overflow-hidden rounded-3xl bg-black/20 shadow-2xl">
            <video
              controls
              playsInline
              poster={typedProspect.flyer_pdf_path ?? undefined}
              src={typedProspect.video_url}
              className="h-auto w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
