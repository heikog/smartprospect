import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Volume2, FileText, Download, ExternalLink } from "lucide-react";

const mockProspects = [
  { id: "001", name: "Max Mustermann", company: "Tech Solutions GmbH" },
  { id: "002", name: "Anna Schmidt", company: "Digital Innovations AG" },
  { id: "003", name: "Thomas Weber", company: "Cloud Systems Ltd" },
];

export function AssetPreview() {
  const [selectedProspect, setSelectedProspect] = useState("001");
  const prospect = mockProspects.find((p) => p.id === selectedProspect);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-slate-600">Prospect auswählen:</span>
          <Select value={selectedProspect} onValueChange={setSelectedProspect}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Prospect wählen" />
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

      <Tabs defaultValue="video">
        <TabsList className="flex-wrap">
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="presentation">Präsentation</TabsTrigger>
          <TabsTrigger value="flyer">Flyer</TabsTrigger>
          <TabsTrigger value="landingpage">Landingpage</TabsTrigger>
        </TabsList>

        <TabsContent value="video">
          <AssetCard
            title="Personalisiertes Avatar-Video"
            subtitle={`für ${prospect?.name}`}
            details={[
              { label: "Format", value: "MP4 (1080p)" },
              { label: "Dauer", value: "45 Sekunden" },
              { label: "Größe", value: "8.2 MB" },
              { label: "Erstellt", value: "01.11.2025, 14:23" },
              { label: "Service", value: "Heygen AI" },
            ]}
          >
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
          </AssetCard>
        </TabsContent>

        <TabsContent value="audio">
          <AssetCard
            title="Personalisierte Audio-Botschaft"
            subtitle={`für ${prospect?.name}`}
            details={[
              { label: "Format", value: "MP3 (320kbps)" },
              { label: "Dauer", value: "30 Sekunden" },
              { label: "Größe", value: "1.2 MB" },
              { label: "Erstellt", value: "01.11.2025, 14:23" },
              { label: "Service", value: "ElevenLabs AI" },
            ]}
          >
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
          </AssetCard>
        </TabsContent>

        <TabsContent value="presentation">
          <AssetCard
            title="Pitch-Präsentation"
            subtitle={`für ${prospect?.name}`}
            details={[
              { label: "Format", value: "PDF" },
              { label: "Seiten", value: "12" },
              { label: "Größe", value: "3.4 MB" },
              { label: "Erstellt", value: "01.11.2025, 14:24" },
              { label: "Service", value: "Gamma.app" },
            ]}
          >
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
          </AssetCard>
        </TabsContent>

        <TabsContent value="flyer">
          <AssetCard
            title="Druckfertiger Flyer"
            subtitle={`für ${prospect?.name}`}
            details={[
              { label: "Format", value: "PDF (druckfertig)" },
              { label: "Auflösung", value: "300 DPI" },
              { label: "Format", value: "A4" },
              { label: "Größe", value: "2.1 MB" },
              { label: "QR-Code", value: "Integriert" },
            ]}
          >
            <div className="aspect-[1/1.4] bg-white border-2 rounded-lg flex items-center justify-center mb-4 max-w-md mx-auto">
              <div className="text-center p-8 space-y-4">
                <div className="w-full h-40 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
                <div className="space-y-2 text-left">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
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
          </AssetCard>
        </TabsContent>

        <TabsContent value="landingpage">
          <AssetCard
            title="Personalisierte Landingpage"
            subtitle={`sp.link/${selectedProspect}`}
            details={[
              { label: "URL", value: `sp.link/${selectedProspect}` },
              { label: "Status", value: "Live" },
              { label: "QR-Code", value: "Verfügbar" },
              { label: "Erstellt", value: "01.11.2025, 14:24" },
            ]}
          >
            <div className="aspect-video bg-slate-100 border-2 rounded-lg overflow-hidden mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 h-20 flex items-center justify-center text-white">
                Personalisierte Landingpage
              </div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="h-12 bg-blue-100 rounded" />
                  <div className="h-12 bg-purple-100 rounded" />
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
          </AssetCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssetCard({
  title,
  subtitle,
  details,
  children,
}: {
  title: string;
  subtitle?: string;
  details: { label: string; value: string }[];
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mb-4">{subtitle}</p>}
          {children}
        </div>
        <div className="w-full lg:w-80 space-y-4">
          <h4 className="font-semibold">Details</h4>
          <div className="space-y-2 text-sm">
            {details.map((detail) => (
              <div key={detail.label} className="flex justify-between">
                <span className="text-slate-500">{detail.label}:</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
