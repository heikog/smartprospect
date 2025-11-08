import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Plus, LogOut } from 'lucide-react';
import { CampaignList } from './CampaignList';
import { CreateCampaign } from './CreateCampaign';
import { CampaignDetail } from './CampaignDetail';

export type Campaign = {
  id: string;
  name: string;
  status: 'draft' | 'generating' | 'review' | 'approved' | 'sent';
  createdAt: string;
  prospectCount: number;
  progress?: number;
};

export function Dashboard() {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('create');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [credits, setCredits] = useState(50);
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'camp-001',
      name: 'Q1 Tech Startups Berlin',
      status: 'review',
      createdAt: '2025-10-28',
      prospectCount: 47,
      progress: 100
    },
    {
      id: 'camp-002',
      name: 'Mittelstand Bayern - Software',
      status: 'generating',
      createdAt: '2025-10-30',
      prospectCount: 152,
      progress: 67
    },
    {
      id: 'camp-003',
      name: 'Enterprise DACH',
      status: 'approved',
      createdAt: '2025-10-25',
      prospectCount: 23,
      progress: 100
    }
  ]);

  const handleCreateCampaign = (campaign: Campaign) => {
    setCampaigns([campaign, ...campaigns]);
    setView('list');
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedCampaign(null);
  };

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
                <p className="text-slate-600">Verwalten Sie Ihre Multichannel-Outreach-Kampagnen</p>
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
          />
        )}

        {view === 'detail' && selectedCampaign && (
          <CampaignDetail 
            campaign={selectedCampaign} 
            onBack={handleBackToList}
          />
        )}
      </main>
    </div>
  );
}
