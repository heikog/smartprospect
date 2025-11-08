import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Download, Send, CheckCircle, Video, FileAudio, FileText, Image as ImageIcon, Globe } from 'lucide-react';
import { Campaign } from './Dashboard';
import { ProspectTable } from './ProspectTable';
import { AssetPreview } from './AssetPreview';

interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
}

export function CampaignDetail({ campaign, onBack }: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zu Kampagnen
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div>
              <span className="text-slate-400">Prospects:</span> {campaign.prospectCount}
            </div>
            <div>
              <span className="text-slate-400">Erstellt:</span> {new Date(campaign.createdAt).toLocaleDateString('de-DE')}
            </div>
            <div>
              <span className="text-slate-400">ID:</span> {campaign.id}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {campaign.status === 'review' && (
            <Button className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Freigeben
            </Button>
          )}
          {campaign.status === 'approved' && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Versand starten
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Stats */}
            <Card className="p-6">
              <h3 className="mb-4">Kampagnen-Statistiken</h3>
              <div className="space-y-4">
                <StatRow label="Generierte Assets" value={`${campaign.prospectCount * 5} / ${campaign.prospectCount * 5}`} />
                <StatRow label="Videos" value={campaign.prospectCount.toString()} />
                <StatRow label="Audio-Dateien" value={campaign.prospectCount.toString()} />
                <StatRow label="Präsentationen" value={campaign.prospectCount.toString()} />
                <StatRow label="Flyer (PDF)" value={campaign.prospectCount.toString()} />
                <StatRow label="Landingpages" value={campaign.prospectCount.toString()} />
              </div>
            </Card>

            {/* Asset Types */}
            <Card className="p-6">
              <h3 className="mb-4">Generierte Asset-Typen</h3>
              <div className="space-y-3">
                <AssetTypeRow icon={<Video className="w-5 h-5" />} label="Personalisierte Videos" count={campaign.prospectCount} />
                <AssetTypeRow icon={<FileAudio className="w-5 h-5" />} label="Audio-Botschaften" count={campaign.prospectCount} />
                <AssetTypeRow icon={<FileText className="w-5 h-5" />} label="Präsentations-PDFs" count={campaign.prospectCount} />
                <AssetTypeRow icon={<ImageIcon className="w-5 h-5" />} label="Druckfertige Flyer" count={campaign.prospectCount} />
                <AssetTypeRow icon={<Globe className="w-5 h-5" />} label="Landingpages" count={campaign.prospectCount} />
              </div>
            </Card>

            {/* File Structure */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="mb-4">Ordnerstruktur</h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{`/${campaign.id}/
├── meta.json
├── campaign-data.xlsx (inkl. Links)
├── service-flyer.pdf
├── /prospect-001/
│   ├── video.mp4 (Heygen)
│   ├── audio.mp3 (ElevenLabs)
│   ├── presentation.pdf (Gamma)
│   ├── flyer.pdf
│   └── landingpage.html
├── /prospect-002/
│   └── ...
└── /prospect-${campaign.prospectCount.toString().padStart(3, '0')}/
    └── ...`}</pre>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prospects">
          <ProspectTable campaignId={campaign.id} />
        </TabsContent>

        <TabsContent value="assets">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                  <Video className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-sm">Prospect {i + 1}</p>
                <p className="text-xs text-slate-400">Max Mustermann GmbH</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <AssetPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const config = {
    draft: { label: 'Entwurf', className: 'bg-slate-100 text-slate-700' },
    generating: { label: 'In Bearbeitung', className: 'bg-blue-100 text-blue-700' },
    review: { label: 'Prüfung', className: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Freigegeben', className: 'bg-green-100 text-green-700' },
    sent: { label: 'Versendet', className: 'bg-slate-100 text-slate-700' }
  }[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function AssetTypeRow({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="text-blue-600">{icon}</div>
        <span className="text-sm">{label}</span>
      </div>
      <Badge variant="secondary">{count}</Badge>
    </div>
  );
}
