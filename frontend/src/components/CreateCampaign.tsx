import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
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
  AlertCircle,
  RotateCw
} from 'lucide-react';
import { Campaign, CampaignStatus } from './Dashboard';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ReviewCampaignDialog } from './ReviewCampaignDialog';

interface CreateCampaignFormValues {
  name: string;
  excelFile: File;
  pdfFile: File;
  prospectCount: number;
}

interface CreateCampaignProps {
  onCancel: () => void;
  onCreate: (payload: CreateCampaignFormValues) => Promise<void>;
  credits: number;
  onBuyCredits: () => void;
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onStartGeneration: (campaign: Campaign) => Promise<void>;
  onRetryGeneration: (campaign: Campaign) => Promise<void>;
  onMarkReadyForReview: (campaign: Campaign) => Promise<void>;
  onApproveCampaign: (campaign: Campaign) => Promise<void>;
  onPrepareDispatch: (campaign: Campaign) => Promise<void>;
  onDispatchCampaign: (campaign: Campaign) => Promise<void>;
}

const statusBadges: Record<CampaignStatus, { label: string; tone: 'neutral' | 'active' | 'warning' | 'success' | 'danger' }> = {
  created: { label: 'Erstellt', tone: 'neutral' },
  generating: { label: 'In Bearbeitung', tone: 'active' },
  generation_failed: { label: 'Problem bei Generierung', tone: 'danger' },
  generated: { label: 'Assets bereit', tone: 'success' },
  ready_for_review: { label: 'Zur Freigabe', tone: 'active' },
  approved: { label: 'Freigegeben', tone: 'success' },
  ready_for_dispatch: { label: 'Bereit für Versand', tone: 'active' },
  dispatched: { label: 'Versandt', tone: 'success' },
  dispatch_failed: { label: 'Problem beim Versand', tone: 'danger' }
};

export function CreateCampaign({
  onCancel,
  onCreate,
  credits,
  onBuyCredits,
  campaigns,
  onSelectCampaign,
  onStartGeneration,
  onRetryGeneration,
  onMarkReadyForReview,
  onApproveCampaign,
  onPrepareDispatch,
  onDispatchCampaign
}: CreateCampaignProps) {
  const [campaignName, setCampaignName] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [campaignToReview, setCampaignToReview] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);

  const resetForm = () => {
    setCampaignName('');
    setExcelFile(null);
    setPdfFile(null);
    setLastError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile || !pdfFile) return;

    const payload: CreateCampaignFormValues = {
      name: campaignName || 'Neue Kampagne',
      excelFile,
      pdfFile,
      prospectCount: Math.floor(Math.random() * 100) + 20
    };

    try {
      setIsSubmitting(true);
      setLastError(null);
      await onCreate(payload);
      resetForm();
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'Unbekannter Fehler beim Erstellen');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadExampleExcel = () => {
    alert('Beispiel-Excel wird heruntergeladen...');
  };

  const handleStatusAction = async (campaign: Campaign, action: () => Promise<void>) => {
    try {
      setPendingCampaignId(campaign.id);
      await action();
    } catch (error) {
      console.error(error);
      alert('Aktion konnte nicht ausgeführt werden. Bitte später erneut versuchen.');
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleOpenReviewDialog = async (campaign: Campaign) => {
    await handleStatusAction(campaign, () => onMarkReadyForReview(campaign));
    setCampaignToReview({ ...campaign, status: 'ready_for_review' });
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!campaignToReview) return;
    await handleStatusAction(campaignToReview, () => onApproveCampaign(campaignToReview));
    setReviewDialogOpen(false);
  };

  const statusClassName = (tone: 'neutral' | 'active' | 'warning' | 'success' | 'danger') => {
    switch (tone) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const statusBadge = (status: CampaignStatus) => {
    const config = statusBadges[status];
    return (
      <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${statusClassName(config.tone)}`}>
        {config.label}
      </span>
    );
  };

  const renderGenerierungCell = (campaign: Campaign) => {
    const isPending = pendingCampaignId === campaign.id;

    if (campaign.status === 'generating') {
      return (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-600">Assets werden generiert…</span>
        </div>
      );
    }

    if (campaign.status === 'generation_failed') {
      return (
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            disabled={isPending}
            onClick={() => handleStatusAction(campaign, () => onRetryGeneration(campaign))}
          >
            <RotateCw className="w-3 h-3 mr-1" />
            Erneut versuchen
          </Button>
        </div>
      );
    }

    if (campaign.status === 'created') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          disabled={isPending}
          onClick={() => handleStatusAction(campaign, () => onStartGeneration(campaign))}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Generierung starten
        </Button>
      );
    }

    return (
      <div className="flex justify-center">
        <CheckCircle className="w-5 h-5 text-green-600" />
      </div>
    );
  };

  const renderReviewCell = (campaign: Campaign) => {
    const isPending = pendingCampaignId === campaign.id;

    if (campaign.status === 'generated' || campaign.status === 'ready_for_review') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="text-xs bg-yellow-50 border-yellow-300 hover:bg-yellow-100"
          disabled={isPending}
          onClick={() => handleOpenReviewDialog(campaign)}
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Zur Prüfung öffnen
        </Button>
      );
    }

    if (campaign.status === 'approved' || campaign.status === 'ready_for_dispatch' || campaign.status === 'dispatched') {
      return (
        <div className="flex justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
      );
    }

    return <span className="text-slate-300">—</span>;
  };

  const renderDispatchCell = (campaign: Campaign) => {
    const isPending = pendingCampaignId === campaign.id;

    if (campaign.status === 'approved') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="text-xs bg-blue-50 border-blue-300 hover:bg-blue-100"
          disabled={isPending}
          onClick={() => handleStatusAction(campaign, () => onPrepareDispatch(campaign))}
        >
          Bereit für Versand
        </Button>
      );
    }

    if (campaign.status === 'ready_for_dispatch') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="text-xs bg-green-50 border-green-300 hover:bg-green-100"
          disabled={isPending}
          onClick={() => handleStatusAction(campaign, () => onDispatchCampaign(campaign))}
        >
          <Send className="w-3 h-3 mr-1" />
          Versand starten
        </Button>
      );
    }

    if (campaign.status === 'dispatch_failed') {
      return (
        <div className="flex flex-col items-center gap-2 text-red-600 text-xs">
          <AlertCircle className="w-5 h-5" />
          <span>Fehler – erneut versuchen</span>
        </div>
      );
    }

    if (campaign.status === 'dispatched') {
      return (
        <div className="flex justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
      );
    }

    return <span className="text-slate-300">—</span>;
  };

  const sortedCampaigns = useMemo(
    () => [...campaigns].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [campaigns]
  );

  return (
    <div>
      {/* Credits Section */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Verfügbare Credits</p>
              <p className="text-4xl">{credits}</p>
            </div>
          </div>
          <Button onClick={onBuyCredits} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Credits kaufen
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-slate-600">
            Pro Kampagne: <span>49 Credits Basis</span> + <span>1 Credit pro Prospect</span>
          </p>
        </div>
      </Card>

      {/* Campaign Creation Form */}
      <Card className="p-8 bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Neue Kampagne anlegen</h1>
          <p className="text-slate-600">
            Laden Sie Ihre Prospect-Liste und Ihr Service-PDF hoch, um eine personalisierte Multichannel-Kampagne zu starten.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Campaign Name */}
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

          {/* Excel Upload */}
          <div>
            <div className="flex items-center justify-between mb-3">
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
              <label htmlFor="excel-upload" className="cursor-pointer">
                {excelFile ? (
                  <div className="flex items-center justify-center gap-4">
                    <FileSpreadsheet className="w-12 h-12 text-green-600" />
                    <div className="text-left">
                      <p>{excelFile.name}</p>
                      <p className="text-sm text-slate-500">{(excelFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="mb-2">Klicken oder Datei hierher ziehen</p>
                    <p className="text-sm text-slate-500">Excel oder CSV mit Ihren Prospect-Daten</p>
                  </div>
                )}
              </label>
            </div>

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Erforderliche Spalten:</strong> URL, Anrede, Vorname, Nachname, Straße, Hausnummer, PLZ, Stadt
                <br />
                <span className="text-sm text-slate-600">Weitere Daten werden in n8n automatisch recherchiert.</span>
              </AlertDescription>
            </Alert>
          </div>

          {/* PDF Upload */}
          <div>
            <Label htmlFor="pdf-upload">Produkt-/Service-PDF *</Label>
            <p className="text-sm text-slate-500 mb-3">Ihr Angebots- oder Informationsflyer, der personalisiert wird.</p>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50">
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                required
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-4">
                    <FileText className="w-12 h-12 text-red-600" />
                    <div className="text-left">
                      <p>{pdfFile.name}</p>
                      <p className="text-sm text-slate-500">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="mb-2">Klicken oder PDF hierher ziehen</p>
                    <p className="text-sm text-slate-500">Max. 10 MB, wird als Basis für alle Assets genutzt.</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {lastError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{lastError}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-blue-100">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !campaignName || !excelFile || !pdfFile}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kampagne wird erstellt…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Kampagne erstellen
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Existing Campaigns Table */}
      <Card className="p-8 mt-8">
        <div className="mb-6">
          <h2 className="text-2xl mb-2">Meine Kampagnen</h2>
          <p className="text-slate-600">Steuern Sie Status und Versand Ihrer Multichannel-Kampagnen.</p>
        </div>

        {sortedCampaigns.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kampagnenname</TableHead>
                  <TableHead>Prospects</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Generierung</TableHead>
                  <TableHead className="text-center">Prüfung & Freigabe</TableHead>
                  <TableHead className="text-center">Versand</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p>{campaign.name}</p>
                        <p className="text-xs text-slate-400">{campaign.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{campaign.prospectCount}</TableCell>
                    <TableCell className="text-slate-600">{new Date(campaign.createdAt).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>{statusBadge(campaign.status)}</TableCell>
                    <TableCell className="text-center">{renderGenerierungCell(campaign)}</TableCell>
                    <TableCell className="text-center">{renderReviewCell(campaign)}</TableCell>
                    <TableCell className="text-center">{renderDispatchCell(campaign)}</TableCell>
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
            <p className="text-sm text-slate-400 mt-1">Erstellen Sie Ihre erste Kampagne oben.</p>
          </div>
        )}
      </Card>

      {/* Review Dialog */}
      {campaignToReview && (
        <ReviewCampaignDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          campaignName={campaignToReview.name}
          campaignId={campaignToReview.id}
          onApprove={handleApprove}
        />
      )}
    </div>
  );
}

