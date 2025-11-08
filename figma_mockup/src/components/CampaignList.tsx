import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { MoreVertical, Eye } from 'lucide-react';
import { Campaign } from './Dashboard';

interface CampaignListProps {
  campaigns: Campaign[];
  onSelect: (campaign: Campaign) => void;
}

export function CampaignList({ campaigns, onSelect }: CampaignListProps) {
  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl">{campaign.name}</h3>
                <StatusBadge status={campaign.status} />
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
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

              {campaign.status === 'generating' && campaign.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Assets werden generiert...</span>
                    <span className="text-slate-900">{campaign.progress}%</span>
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={() => onSelect(campaign)}>
                <Eye className="w-4 h-4 mr-2" />
                Ansehen
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {campaigns.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400">Noch keine Kampagnen erstellt</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const variants: Record<Campaign['status'], { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    draft: { label: 'Entwurf', variant: 'secondary' },
    generating: { label: 'In Bearbeitung', variant: 'default' },
    review: { label: 'Prüfung', variant: 'outline' },
    approved: { label: 'Freigegeben', variant: 'default' },
    sent: { label: 'Versendet', variant: 'secondary' }
  };

  const config = variants[status];
  
  return (
    <Badge variant={config.variant} className={
      status === 'generating' ? 'bg-blue-100 text-blue-700 border-blue-200' :
      status === 'review' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
      status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
      status === 'sent' ? 'bg-slate-100 text-slate-700' :
      ''
    }>
      {config.label}
    </Badge>
  );
}
