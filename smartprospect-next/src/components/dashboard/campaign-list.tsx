import type { Campaign } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Trash2 } from "lucide-react";

interface CampaignListProps {
  campaigns: Campaign[];
  onSelect: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
}

export function CampaignList({ campaigns, onSelect, onDelete }: CampaignListProps) {
  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">{campaign.name}</h3>
                <StatusBadge status={campaign.status} />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <div>
                  <span className="text-slate-400">Prospects:</span>{" "}
                  {campaign.prospect_count}
                </div>
                <div>
                  <span className="text-slate-400">Erstellt:</span>{" "}
                  {new Date(campaign.created_at).toLocaleDateString("de-DE")}
                </div>
                <div>
                  <span className="text-slate-400">ID:</span> {campaign.id}
                </div>
              </div>

              {campaign.status === "generating" && campaign.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Assets werden generiert...</span>
                    <span className="text-slate-900 font-medium">
                      {campaign.progress}%
                    </span>
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onSelect(campaign)}>
                <Eye className="w-4 h-4 mr-2" />
                Ansehen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(campaign.id)}
                title="Kampagne löschen"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {campaigns.length === 0 && (
        <Card className="p-10 text-center">
          <h3 className="text-2xl font-semibold mb-2">Noch keine Kampagne</h3>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Laden Sie eine Prospect-Liste und Ihr Service-PDF hoch – SmartProspect generiert automatisch Videos, Landingpages und Flyer für jeden Kontakt.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <p className="text-sm text-slate-500">Onboarding-Checkliste:</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Excel-Template herunterladen und befüllen</li>
              <li>• Service-/Produkt-PDF bereitstellen</li>
              <li>• Kampagne anlegen und Assets prüfen</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Campaign["status"] }) {
  const labelMap: Record<Campaign["status"], string> = {
    draft: "Entwurf",
    generating: "In Bearbeitung",
    review: "Prüfung",
    approved: "Freigegeben",
    sent: "Versendet",
  };

  const classMap: Record<Campaign["status"], string> = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    generating: "bg-blue-100 text-blue-700 border-blue-200",
    review: "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    sent: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <Badge variant="outline" className={classMap[status]}>
      {labelMap[status]}
    </Badge>
  );
}
