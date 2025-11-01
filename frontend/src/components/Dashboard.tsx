import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Plus, LogOut } from 'lucide-react';
import { CampaignList } from './CampaignList';
import { CreateCampaign } from './CreateCampaign';
import { CampaignDetail } from './CampaignDetail';
import { createCampaign, listCampaigns, updateCampaignStatus, type CampaignRecord } from '../services/campaigns';

export type CampaignStatus =
  | 'created'
  | 'generating'
  | 'generation_failed'
  | 'generated'
  | 'ready_for_review'
  | 'approved'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'dispatch_failed';

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  prospectCount: number;
  progress?: number;
  lastError?: string;
  dispatchedAt?: string;
};

const fallbackCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Q1 Tech Startups Berlin',
    status: 'ready_for_review',
    createdAt: '2025-10-29T08:15:00.000Z',
    prospectCount: 47,
    progress: 100
  },
  {
    id: 'camp-002',
    name: 'Mittelstand Bayern - Software',
    status: 'generating',
    createdAt: '2025-10-30T10:12:00.000Z',
    prospectCount: 152,
    progress: 67
  },
  {
    id: 'camp-003',
    name: 'Enterprise DACH',
    status: 'ready_for_dispatch',
    createdAt: '2025-10-24T13:45:00.000Z',
    prospectCount: 23,
    progress: 100
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mapCampaignRecord = (record: CampaignRecord): Campaign => ({
  id: record.id,
  name: record.name,
  status: record.status,
  createdAt: record.created_at,
  prospectCount: record.total_prospects,
  progress: record.status === 'generating' ? 25 : record.status === 'created' ? 0 : 100,
  lastError: record.last_error ?? undefined,
  dispatchedAt: record.dispatched_at ?? undefined
});

export function Dashboard() {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('create');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [credits] = useState(50);
  const [campaigns, setCampaigns] = useState<Campaign[]>(fallbackCampaigns);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshCampaigns = useCallback(async () => {
    try {
      const data = await listCampaigns();
      if (data.length === 0) {
        setCampaigns(fallbackCampaigns);
        return;
      }
      setCampaigns(data.map(mapCampaignRecord));
    } catch (error) {
      console.error('Fehler beim Laden der Kampagnen', error);
      setLoadError('Kampagnen konnten nicht von Supabase geladen werden. Demo-Daten werden angezeigt.');
      setCampaigns(fallbackCampaigns);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCampaigns();
  }, [refreshCampaigns]);

  useEffect(() => {
    if (!selectedCampaign) return;
    const updated = campaigns.find((campaign) => campaign.id === selectedCampaign.id);
    if (updated) {
      setSelectedCampaign(updated);
    }
  }, [campaigns, selectedCampaign]);

  const updateLocalCampaign = useCallback((id: string, patch: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((campaign) => (campaign.id === id ? { ...campaign, ...patch } : campaign))
    );
  }, []);

  const handleCreateCampaign = useCallback(
    async (payload: { name: string; excelFile: File; pdfFile: File; prospectCount: number }) => {
      try {
        const record = await createCampaign({
          name: payload.name,
          servicePdfPath: `campaigns/demo/${payload.pdfFile.name}`,
          totalProspects: payload.prospectCount
        });
        const mapped = mapCampaignRecord(record);
        setCampaigns((prev) => [mapped, ...prev]);
      } catch (error) {
        console.error('Kampagne konnte nicht angelegt werden', error);
        const fallback: Campaign = {
          id: `local-${Date.now()}`,
          name: payload.name,
          status: 'created',
          createdAt: new Date().toISOString(),
          prospectCount: payload.prospectCount,
          progress: 0,
          lastError: 'Offline-Demo: Kampagne nur lokal gespeichert.'
        };
        setCampaigns((prev) => [fallback, ...prev]);
        setLoadError('Kampagne konnte nicht in Supabase angelegt werden. Demo-Eintrag erstellt.');
      } finally {
        setView('list');
      }
    },
    []
  );

  const handleStartGeneration = useCallback(
    async (campaign: Campaign) => {
      updateLocalCampaign(campaign.id, { status: 'generating', progress: 15, lastError: undefined });
      try {
        await updateCampaignStatus({ campaignId: campaign.id, status: 'generating' });
        await delay(600);
        updateLocalCampaign(campaign.id, { status: 'generated', progress: 100 });
        await updateCampaignStatus({ campaignId: campaign.id, status: 'generated' });
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Kampagnenstatus', error);
        updateLocalCampaign(campaign.id, {
          status: 'generation_failed',
          lastError: 'Generierung fehlgeschlagen. Bitte erneut versuchen.'
        });
      }
    },
    [updateLocalCampaign]
  );

  const handleRetryGeneration = useCallback(
    async (campaign: Campaign) => {
      await handleStartGeneration(campaign);
    },
    [handleStartGeneration]
  );

  const handleMarkReadyForReview = useCallback(
    async (campaign: Campaign) => {
      updateLocalCampaign(campaign.id, { status: 'ready_for_review' });
      try {
        await updateCampaignStatus({ campaignId: campaign.id, status: 'ready_for_review' });
      } catch (error) {
        console.error('Fehler beim Setzen auf Freigabe', error);
        await refreshCampaigns();
      }
    },
    [refreshCampaigns, updateLocalCampaign]
  );

  const handleApproveCampaign = useCallback(
    async (campaign: Campaign) => {
      updateLocalCampaign(campaign.id, { status: 'approved' });
      try {
        await updateCampaignStatus({ campaignId: campaign.id, status: 'approved', fields: { approved_at: new Date().toISOString() } });
      } catch (error) {
        console.error('Fehler beim Freigeben der Kampagne', error);
        await refreshCampaigns();
      }
    },
    [refreshCampaigns, updateLocalCampaign]
  );

  const handlePrepareDispatch = useCallback(
    async (campaign: Campaign) => {
      updateLocalCampaign(campaign.id, { status: 'ready_for_dispatch' });
      try {
        await updateCampaignStatus({ campaignId: campaign.id, status: 'ready_for_dispatch' });
      } catch (error) {
        console.error('Fehler bei Versandvorbereitung', error);
        await refreshCampaigns();
      }
    },
    [refreshCampaigns, updateLocalCampaign]
  );

  const handleDispatchCampaign = useCallback(
    async (campaign: Campaign) => {
      const dispatchedAt = new Date().toISOString();
      updateLocalCampaign(campaign.id, { status: 'dispatched', dispatchedAt });
      try {
        await updateCampaignStatus({
          campaignId: campaign.id,
          status: 'dispatched',
          fields: { dispatched_at: dispatchedAt }
        });
      } catch (error) {
        console.error('Fehler beim Abschließen des Versands', error);
        await refreshCampaigns();
      }
    },
    [refreshCampaigns, updateLocalCampaign]
  );

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedCampaign(null);
  };

  const headerSubtitle = useMemo(() => {
    if (isLoading) return 'Lade Kampagnen …';
    if (loadError) return loadError;
    return 'Verwalten Sie Ihre Multichannel-Outreach-Kampagnen';
  }, [isLoading, loadError]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl">Smart Prospect</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setView('list')}>
              Meine Kampagnen
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'list' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl mb-2">Kampagnen</h1>
                <p className="text-slate-600">{headerSubtitle}</p>
              </div>
              <Button onClick={() => setView('create')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Neue Kampagne
              </Button>
            </div>

            <CampaignList campaigns={campaigns} onSelect={handleSelectCampaign} />
          </div>
        )}

        {view === 'create' && (
          <CreateCampaign
            onCancel={() => setView('list')}
            onCreate={handleCreateCampaign}
            credits={credits}
            onBuyCredits={() => alert('Credits kaufen - Stripe Integration')}
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onStartGeneration={handleStartGeneration}
            onRetryGeneration={handleRetryGeneration}
            onMarkReadyForReview={handleMarkReadyForReview}
            onApproveCampaign={handleApproveCampaign}
            onPrepareDispatch={handlePrepareDispatch}
            onDispatchCampaign={handleDispatchCampaign}
          />
        )}

        {view === 'detail' && selectedCampaign && (
          <CampaignDetail campaign={selectedCampaign} onBack={handleBackToList} />
        )}
      </main>
    </div>
  );
}

