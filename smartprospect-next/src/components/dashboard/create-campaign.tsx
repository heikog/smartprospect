"use client";

import { useState, type ReactNode } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Database, Campaign, Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Info,
  Download,
  Plus,
  Sparkles,
} from "lucide-react";
import { BuyCreditsDialog } from "./credit-dialog";

interface CreateCampaignProps {
  onCancel: () => void;
  onCreate: (campaign: Campaign) => void;
  onProfileRefresh: () => Promise<void>;
  profile: Profile;
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
}

const BASE_CAMPAIGN_COST = 50;

export function CreateCampaign({
  onCancel,
  onCreate,
  onProfileRefresh,
  profile,
}: CreateCampaignProps) {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [campaignName, setCampaignName] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) {
      setError("Bitte melden Sie sich an.");
      return;
    }
    if (!excelFile || !pdfFile) {
      setError("Bitte laden Sie sowohl Excel- als auch PDF-Datei hoch.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const campaignId = crypto.randomUUID();
    const basePath = `${session.user.id}/${campaignId}`;
    const excelExtension = excelFile.name.split(".").pop() ?? "xlsx";
    const pdfExtension = pdfFile.name.split(".").pop() ?? "pdf";
    const excelPath = `${basePath}/prospects.${excelExtension}`;
    const pdfPath = `${basePath}/service.${pdfExtension}`;

    try {
      const { error: excelUploadError } = await supabase.storage
        .from("campaign-uploads")
        .upload(excelPath, excelFile, { upsert: true });
      if (excelUploadError) throw excelUploadError;

      const { error: pdfUploadError } = await supabase.storage
        .from("campaign-uploads")
        .upload(pdfPath, pdfFile, { upsert: true });
      if (pdfUploadError) throw pdfUploadError;

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          name: campaignName,
          excelPath,
          pdfPath,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Kampagne konnte nicht erstellt werden.");
      }

      const { campaign } = await response.json();
      onCreate(campaign as Campaign);
      await onProfileRefresh();
      setCampaignName("");
      setExcelFile(null);
      setPdfFile(null);
    } catch (uploadError) {
      console.error(uploadError);
      setError(uploadError instanceof Error ? uploadError.message : "Unbekannter Fehler");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadExampleExcel = () => {
    window.alert("Template folgt. Bitte nutzen Sie vorerst Ihr bestehendes Excel.");
  };

  return (
    <div className="space-y-8">
      <BuyCreditsDialog open={buyCreditsOpen} onOpenChange={setBuyCreditsOpen} />

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Verfügbare Credits</p>
              <p className="text-4xl font-semibold">{profile.credits}</p>
            </div>
          </div>
          <Button onClick={() => setBuyCreditsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Credits kaufen
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200 text-sm text-slate-600">
          Pro Kampagne: <span className="font-medium">{BASE_CAMPAIGN_COST} Credits Basis</span> +
          <span className="font-medium"> 1 Credit pro Prospect</span>
        </div>
      </Card>

      <Card className="p-8 bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl mb-2 font-semibold">Neue Kampagne anlegen</h1>
          <p className="text-slate-600">
            Laden Sie Ihre Prospect-Liste und Ihr Service-PDF hoch, um eine personalisierte Multichannel-Kampagne zu starten.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <Label htmlFor="campaign-name">Kampagnenname *</Label>
            <Input
              id="campaign-name"
              placeholder="z.B. Q1 Tech Startups Berlin"
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
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

            <FileDropzone
              id="excel-upload"
              file={excelFile}
              icon={<FileSpreadsheet className="w-12 h-12 text-green-600" />}
              accept=".xlsx,.xls,.csv"
              onChange={setExcelFile}
              description="Excel oder CSV mit Ihren Prospect-Daten"
            />

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Erforderliche Spalten:</strong> url, anrede, vorname, nachname, strasse, hausnummer, plz, stadt
                <br />
                <span className="text-sm text-slate-600">
                  Diese Angaben werden für den personalisierten Versand benötigt.
                </span>
              </AlertDescription>
            </Alert>
          </div>

          <div>
            <Label htmlFor="pdf-upload">Produkt-/Service-PDF *</Label>
            <p className="text-sm text-slate-500 mb-3">Ihr Angebots- oder Informationsflyer, der personalisiert wird.</p>

            <FileDropzone
              id="pdf-upload"
              file={pdfFile}
              icon={<FileText className="w-12 h-12 text-red-600" />}
              accept=".pdf"
              onChange={setPdfFile}
              description="Ihr Service- oder Produktflyer (max. 10 MB)"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-6 border-t border-blue-100">
            <Button type="button" variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={submitting || !excelFile || !pdfFile}
            >
              {submitting ? "Wird verarbeitet..." : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Kampagne erstellen
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function FileDropzone({
  id,
  file,
  icon,
  accept,
  onChange,
  description,
}: {
  id: string;
  file: File | null;
  icon: ReactNode;
  accept: string;
  onChange: (file: File | null) => void;
  description: string;
}) {
  return (
    <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50">
      <input
        type="file"
        id={id}
        accept={accept}
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
      <label htmlFor={id} className="cursor-pointer flex flex-col items-center gap-4">
        {file ? (
          <div className="flex items-center justify-center gap-4">
            {icon}
            <div className="text-left">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-16 h-16 text-slate-400" />
            <div>
              <p className="mb-2 font-medium">Klicken oder Datei hierher ziehen</p>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </>
        )}
      </label>
    </div>
  );
}
