import { useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText, Download, ExternalLink, MonitorPlay } from 'lucide-react';
import { ProspectLandingPage } from './ProspectLandingPage';
import { Link } from 'react-router-dom';

const mockProspects = [
  { id: '001', name: 'Max Mustermann', company: 'Tech Solutions GmbH', stadt: 'Berlin', url: 'https://techsolutions.de', anrede: 'Herr', nachname: 'Mustermann', vorname: 'Max' },
  { id: '002', name: 'Anna Schmidt', company: 'Digital Innovations AG', stadt: 'München', url: 'https://digital-innovations.de', anrede: 'Frau', nachname: 'Schmidt', vorname: 'Anna' },
  { id: '003', name: 'Thomas Weber', company: 'Cloud Systems Ltd', stadt: 'Hamburg', url: 'https://cloudsystems.com', anrede: 'Herr', nachname: 'Weber', vorname: 'Thomas' }
];

export function AssetPreview() {
  const [selectedProspectId, setSelectedProspectId] = useState('001');
  const [showLandingPreview, setShowLandingPreview] = useState(false);

  const prospect = mockProspects.find((p) => p.id === selectedProspectId)!;
  const previewUrl = useMemo(() => {
    const base =
      import.meta.env.VITE_APP_URL ??
      (typeof window !== 'undefined' ? window.location.origin : 'https://smartprospect.app');
    return `${base}/preview/camp-xyz/${selectedProspectId}`;
  }, [selectedProspectId]);

  return (
    <div className="space-y-6">
      {/* Prospect Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Prospect auswählen:</span>
          <Select value={selectedProspectId} onValueChange={setSelectedProspectId}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Prospect auswählen" />
            </SelectTrigger>
            <SelectContent>
              {mockProspects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} – {p.company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Assets Tabs */}
      <Tabs defaultValue="flyer">
        <TabsList>
          <TabsTrigger value="flyer">PDF-Mailing</TabsTrigger>
          <TabsTrigger value="landingpage">Landingpage</TabsTrigger>
        </TabsList>

        <TabsContent value="flyer">
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="aspect-[1/1.4] bg-white border-2 rounded-lg flex items-center justify-center mb-4 max-w-md mx-auto">
                  <div className="text-center p-8">
                    <div className="w-full h-40 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4"></div>
                    <div className="space-y-2 text-left">
                      <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                      <div className="mt-4 h-10 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-500">
                        Personalisierter QR-Code → sp.link/{selectedProspectId}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF Vorschau
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Herunterladen
                  </Button>
                </div>
              </div>
              <div className="w-80 space-y-4">
                <div>
                  <h3 className="mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <DetailRow label="Format" value="PDF (druckfertig, A4)" />
                    <DetailRow label="Auflösung" value="300 DPI" />
                    <DetailRow label="Größe" value="2,1 MB" />
                    <DetailRow label="Erstellt" value="01.11.2025, 14:24" />
                    <DetailRow label="QR-Code" value={`sp.link/${selectedProspectId}`} />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2">Personalisierte Elemente</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• individuelle Ansprache mit Name & Anrede</li>
                    <li>• Bezug auf Standort {prospect.stadt}</li>
                    <li>• QR-Code zur Prospect-Landingpage</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="landingpage">
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="aspect-video bg-slate-100 border-2 rounded-lg overflow-hidden mb-4">
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 h-20 flex items-center justify-center text-white">
                    Smart Prospect – Personalisierte Landingpage
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="h-12 bg-blue-100 rounded"></div>
                      <div className="h-12 bg-purple-100 rounded"></div>
                    </div>
                    <div className="h-32 bg-white border border-dashed border-slate-300 rounded flex items-center justify-center text-xs text-slate-400">
                      Formular zur Lead-Erfassung
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowLandingPreview(true)}>
                    <MonitorPlay className="w-4 h-4 mr-2" />
                    Landingpage ansehen
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={previewUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live-Link öffnen
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="w-80 space-y-4">
                <div>
                  <h3 className="mb-2">Parameter</h3>
                  <div className="space-y-2 text-sm">
                    <DetailRow label="URL" value={previewUrl} />
                    <DetailRow label="Kampagne" value="camp-xyz" />
                    <DetailRow label="Prospect" value={selectedProspectId} />
                    <DetailRow label="Status" value="Live" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2">Lead Capture</h3>
                  <p className="text-sm text-slate-600">
                    Formular sammelt E-Mail & Telefon, Daten werden direkt in Supabase gespeichert und im CRM weitergeleitet.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <ProspectLandingPage
        open={showLandingPreview}
        onOpenChange={setShowLandingPreview}
        prospect={{
          id: prospect.id,
          anrede: prospect.anrede,
          vorname: prospect.vorname,
          nachname: prospect.nachname,
          stadt: prospect.stadt,
          url: prospect.url
        }}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
