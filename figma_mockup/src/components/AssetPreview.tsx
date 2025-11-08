import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Play, Volume2, FileText, Download, ExternalLink } from 'lucide-react';

const mockProspects = [
  { id: '001', name: 'Max Mustermann', company: 'Tech Solutions GmbH' },
  { id: '002', name: 'Anna Schmidt', company: 'Digital Innovations AG' },
  { id: '003', name: 'Thomas Weber', company: 'Cloud Systems Ltd' }
];

export function AssetPreview() {
  const [selectedProspect, setSelectedProspect] = useState('001');

  const prospect = mockProspects.find(p => p.id === selectedProspect);

  return (
    <div className="space-y-6">
      {/* Prospect Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Prospect auswählen:</span>
          <Select value={selectedProspect} onValueChange={setSelectedProspect}>
            <SelectTrigger className="w-80">
              <SelectValue />
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
      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="presentation">Präsentation</TabsTrigger>
          <TabsTrigger value="flyer">Flyer</TabsTrigger>
          <TabsTrigger value="landingpage">Landingpage</TabsTrigger>
        </TabsList>

        <TabsContent value="video">
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-3 opacity-70" />
                    <p className="text-sm opacity-70">Personalisiertes Avatar-Video</p>
                    <p className="text-xs opacity-50 mt-1">für {prospect?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Abspielen
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
                    <DetailRow label="Format" value="MP4 (1080p)" />
                    <DetailRow label="Dauer" value="45 Sekunden" />
                    <DetailRow label="Größe" value="8.2 MB" />
                    <DetailRow label="Erstellt" value="01.11.2025, 14:23" />
                    <DetailRow label="Service" value="Heygen AI" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="audio">
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Volume2 className="w-16 h-16 mx-auto mb-3 text-purple-600" />
                    <p className="text-sm">Personalisierte Audio-Botschaft</p>
                    <p className="text-xs text-slate-500 mt-1">für {prospect?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Abspielen
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
                    <DetailRow label="Format" value="MP3 (320kbps)" />
                    <DetailRow label="Dauer" value="30 Sekunden" />
                    <DetailRow label="Größe" value="1.2 MB" />
                    <DetailRow label="Erstellt" value="01.11.2025, 14:23" />
                    <DetailRow label="Service" value="ElevenLabs AI" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="presentation">
          <Card className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="aspect-[4/3] bg-white border-2 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-3 text-blue-600" />
                    <p className="text-sm">Pitch-Präsentation</p>
                    <p className="text-xs text-slate-500 mt-1">für {prospect?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Öffnen
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
                    <DetailRow label="Format" value="PDF" />
                    <DetailRow label="Seiten" value="12" />
                    <DetailRow label="Größe" value="3.4 MB" />
                    <DetailRow label="Erstellt" value="01.11.2025, 14:24" />
                    <DetailRow label="Service" value="Gamma.app" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

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
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Vorschau
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
                    <DetailRow label="Format" value="PDF (druckfertig)" />
                    <DetailRow label="Auflösung" value="300 DPI" />
                    <DetailRow label="Format" value="A4" />
                    <DetailRow label="Größe" value="2.1 MB" />
                    <DetailRow label="QR-Code" value="Integriert" />
                  </div>
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
                    Personalisierte Landingpage
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="h-12 bg-blue-100 rounded"></div>
                      <div className="h-12 bg-purple-100 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Landingpage öffnen
                  </Button>
                  <Button size="sm" variant="outline">
                    QR-Code anzeigen
                  </Button>
                </div>
              </div>
              <div className="w-80 space-y-4">
                <div>
                  <h3 className="mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <DetailRow label="URL" value={`sp.link/${selectedProspect}`} />
                    <DetailRow label="Status" value="Live" />
                    <DetailRow label="QR-Code" value="Verfügbar" />
                    <DetailRow label="Erstellt" value="01.11.2025, 14:24" />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="w-32 h-32 bg-white border-2 mx-auto flex items-center justify-center">
                    <div className="text-xs text-slate-400">QR Code</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
