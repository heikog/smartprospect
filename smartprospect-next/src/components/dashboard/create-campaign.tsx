import { useState } from "react";
import { Campaign } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Info,
  Download,
  Plus,
  Sparkles,
  Eye,
  MoreVertical,
  CheckCircle,
  Loader2,
  Send,
} from "lucide-react";
import { ReviewCampaignDialog } from "./review-campaign-dialog";

interface CreateCampaignProps {
  onCancel: () => void;
  onCreate: (campaign: Campaign) => void;
  credits: number;
  onBuyCredits: () => void;
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
}

export function CreateCampaign({
  onCancel,
  onCreate,
  credits,
  onBuyCredits,
  campaigns,
  onSelectCampaign,
}: CreateCampaignProps) {
  const [campaignName, setCampaignName] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [campaignToReview, setCampaignToReview] = useState<Campaign | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: campaignName || "Neue Kampagne",
      status: "generating",
      createdAt: new Date().toISOString().split("T")[0],
      prospectCount: Math.floor(Math.random() * 100) + 20,
      progress: 0,
    };

    onCreate(newCampaign);
    setCampaignName("");
    setExcelFile(null);
    setPdfFile(null);
  };

  const downloadExampleExcel = () => {
    alert("Beispiel-Excel wird heruntergeladen...");
  };

  const handleOpenReviewDialog = (campaign: Campaign) => {
    setCampaignToReview(campaign);
    setReviewDialogOpen(true);
  };

  const handleApproveCampaign = () => {
    if (campaignToReview) {
      alert(`Kampagne "${campaignToReview.name}" wurde freigegeben!`);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Verfügbare Credits</p>
              <p className="text-4xl font-semibold">{credits}</p>
            </div>
          </div>
          <Button onClick={onBuyCredits} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Credits kaufen
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200 text-sm text-slate-600">
          Pro Kampagne: <span className="font-medium">49 Credits Basis</span> +{" "}
          <span className="font-medium">1 Credit pro Prospect</span>
        </div>
      </Card>

      <Card className="p-8 bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl mb-2 font-semibold">Neue Kampagne anlegen</h1>
          <p className="text-slate-600">
            Laden Sie Ihre Prospect-Liste und Ihr Service-PDF hoch, um eine personalisierte Multichannel-Kampagne zu starten
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <Label htmlFor="campaign-name">Kampagnenname *</Label>
            <Input
              id="campaign-name"
              placeholder="z.B. Q1 Tech Startups Berlin"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <Label htmlFor="excel-upload">Prospect-Liste (Excel/CSV) *</Label>
              <Button type="button" variant="outline" size="sm" onClick={downloadExampleExcel}>
                <Download className="w-4 h-4 mr-2" />
                Beispiel Excel
              </Button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50">
              <input
                type="file"
                id="excel-upload"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                required
              />
              <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-4">
                {excelFile ? (
                  <div className="flex items-center justify-center gap-4">
                    <FileSpreadsheet className="w-12 h-12 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">{excelFile.name}</p>
                      <p className="text-sm text-slate-500">{(excelFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-slate-400" />
                    <div>
                      <p className="mb-2 font-medium">Klicken oder Datei hierher ziehen</p>
                      <p className="text-sm text-slate-500">Excel oder CSV mit Ihren Prospect-Daten</p>
                    </div>
                  </>
                )}
              </label>
            </div>

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Erforderliche Spalten:</strong> URL, Anrede, Vorname, Nachname, Straße, Hausnummer, PLZ, Stadt
                <br />
                <span className="text-sm text-slate-600">
                  Diese Angaben werden für den personalisierten Versand der Flyer benötigt.
                </span>
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <Label htmlFor="pdf-upload">Produkt-/Service-PDF *</Label>
            <p className="text-sm text-slate-500 mb-3">Ihr Angebots- oder Informationsflyer, der personalisiert wird</p>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50">
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                required
              />
              <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-4">
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-4">
                    <FileText className="w-12 h-12 text-red-600" />
                    <div className="text-left">
                      <p className="font-medium">{pdfFile.name}</p>
                      <p className="text-sm text-slate-500">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-slate-400" />
                    <div>
                      <p className="mb-2 font-medium">Klicken oder PDF hierher ziehen</p>
                      <p className="text-sm text-slate-500">Ihr Service- oder Produktflyer (max. 10 MB)</p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-blue-100">
            <Button type="button" variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!campaignName || !excelFile || !pdfFile}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Kampagne erstellen
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Meine Kampagnen</h2>
          <p className="text-slate-600">Übersicht über alle erstellten Kampagnen</p>
        </div>

        {campaigns.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kampagnenname</TableHead>
                  <TableHead>Prospects</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead className="text-center">Erstellt</TableHead>
                  <TableHead className="text-center">Generiert</TableHead>
                  <TableHead className="text-center">Freigegeben</TableHead>
                  <TableHead className="text-center">Versendet</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-xs text-slate-400">{campaign.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{campaign.prospectCount}</TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(campaign.createdAt).toLocaleDateString("de-DE")}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {campaign.status === "draft" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => alert("Generierung starten")}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Generieren
                        </Button>
                      ) : campaign.status === "generating" ? (
                        <div className="flex flex-col items-center gap-1">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          <span className="text-xs text-slate-600">
                            {campaign.progress ?? 0}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {campaign.status === "review" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs bg-yellow-50 border-yellow-300 hover:bg-yellow-100"
                          onClick={() => handleOpenReviewDialog(campaign)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Freigeben
                        </Button>
                      ) : campaign.status === "approved" || campaign.status === "sent" ? (
                        <div className="flex justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <span className="text-slate-300">—</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {campaign.status === "approved" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs bg-green-50 border-green-300 hover:bg-green-100"
                          onClick={() => alert("Versand starten")}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Versenden
                        </Button>
                      ) : campaign.status === "sent" ? (
                        <div className="flex justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <span className="text-slate-300">—</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onSelectCampaign(campaign)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-slate-400">Noch keine Kampagnen erstellt</p>
            <p className="text-sm text-slate-400 mt-1">
              Erstellen Sie Ihre erste Kampagne oben
            </p>
          </div>
        )}
      </Card>

      {campaignToReview && (
        <ReviewCampaignDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          campaignName={campaignToReview.name}
          campaignId={campaignToReview.id}
          onApprove={handleApproveCampaign}
        />
      )}
    </div>
  );
}
