import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { CampaignStatus, Tables } from "@/types/database";
import { CampaignActions } from "@/components/dashboard/CampaignActions";

const statusLabel: Record<CampaignStatus, string> = {
  in_erstllg: "In Erstellung",
  bereit_zur_pruefung: "Bereit zur Prüfung",
  geprueft: "Geprüft",
  versandt: "Versandt",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: balance }, { data: campaign, error }] = await Promise.all([
    supabase.from("user_credit_balances").select("credits").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("campaigns")
      .select("*, campaign_prospects(*)")
      .eq("user_id", user.id)
      .eq("id", params.id)
      .maybeSingle(),
  ]);

  if (error || !campaign) {
    notFound();
  }

  const prospects = (campaign.campaign_prospects ?? []) as Tables<"campaign_prospects">[];

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader email={user.email} credits={balance?.credits ?? 0} />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Kampagne</p>
            <h1 className="text-3xl font-semibold text-slate-900">{campaign.name}</h1>
            <p className="text-sm text-slate-500">
              Erstellt am {formatDate(campaign.created_at)} · {campaign.row_count} Prospects
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-indigo-600">
            Zurück
          </Link>
        </div>

        <Card className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant={campaign.status}>{statusLabel[campaign.status]}</Badge>
            <span className="text-sm text-slate-500">
              Letztes Update: {formatDate(campaign.last_status_change)}
            </span>
          </div>
          <CampaignActions campaignId={campaign.id} status={campaign.status} />
          <div className="flex gap-3 text-sm text-slate-500">
            <span>Excel Pfad: {campaign.source_excel_path}</span>
            <span className="hidden md:inline">|</span>
            <span>Service-PDF Pfad: {campaign.service_pdf_path}</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Prospects</h2>
              <p className="text-sm text-slate-500">
                n8n stellt Assets & Landingpage-Links bereit. Token-gesicherter Zugang über {env.APP_BASE_URL}/p/&lt;campaign&gt;/&lt;prospect&gt;
              </p>
            </div>
            <Button asChild variant="secondary">
              <a href={`mailto:support@smartprospect.app?subject=Kampagne ${campaign.name}`}>Support kontaktieren</a>
            </Button>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">#</th>
                  <th>Firma</th>
                  <th>Adresse</th>
                  <th>Landingpage</th>
                  <th>Flyer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prospects.map((prospect) => (
                  <tr key={prospect.id}>
                    <td className="py-3 text-slate-500">{prospect.row_index}</td>
                    <td className="py-3">
                      <div className="font-medium text-slate-900">{prospect.company_url}</div>
                      <div className="text-xs text-slate-500">
                        {prospect.anrede} {prospect.vorname} {prospect.nachname}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">
                      {prospect.strasse} {prospect.hausnummer}, {prospect.plz} {prospect.ort}
                    </td>
                    <td className="py-3 text-indigo-600">
                      {prospect.landingpage_path ? (
                        <a href={prospect.landingpage_path} target="_blank" rel="noopener noreferrer">
                          Landingpage öffnen
                        </a>
                      ) : (
                        <span className="text-slate-400">Offen</span>
                      )}
                    </td>
                    <td className="py-3 text-indigo-600">
                      {prospect.flyer_pdf_path ? (
                        <a href={prospect.flyer_pdf_path} target="_blank" rel="noopener noreferrer">
                          Flyer
                        </a>
                      ) : (
                        <span className="text-slate-400">Offen</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prospects.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                Noch keine Prospects importiert. Warte auf den Callback von n8n Workflow #1.
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
