"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Prospect } from "@/types/database";
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
import { Play, Volume2, Download, ExternalLink } from "lucide-react";

interface AssetPreviewProps {
  prospects: Prospect[];
}

export function AssetPreview({ prospects }: AssetPreviewProps) {
  const options = useMemo(() => prospects.map((p) => ({
    id: p.id,
    label: p.company_name ?? (p.contact as Record<string, string>)?.name ?? p.id,
  })), [prospects]);
  const [selectedProspectId, setSelectedProspectId] = useState<string>(options[0]?.id ?? "");

  const prospect = prospects.find((p) => p.id === selectedProspectId) ?? prospects[0];

  if (!prospect) {
    return (
      <div className="text-sm text-slate-500">Noch keine Assets verfügbar.</div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-slate-600">Prospect auswählen:</span>
          <Select
            value={selectedProspectId || prospect.id}
            onValueChange={setSelectedProspectId}
          >
            <SelectTrigger className="w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(({ id, label }) => (
                <SelectItem key={id} value={id}>
                  {label}
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
            subtitle={prospect.company_name ?? ""}
            details={[
              { label: "Status", value: prospect.status },
              { label: "Letztes Update", value: new Date(prospect.created_at).toLocaleString("de-DE") },
            ]}
            actions={
              prospect.video_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={prospect.video_url} target="_blank" rel="noreferrer">
                    <Play className="w-4 h-4 mr-2" />
                    Abspielen
                  </a>
                </Button>
              )
            }
          />
        </TabsContent>

        <TabsContent value="audio">
          <AssetCard
            title="Audio-Botschaft"
            subtitle={prospect.company_name ?? ""}
            details={[
              { label: "Status", value: prospect.status },
            ]}
            actions={
              prospect.audio_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={prospect.audio_url} target="_blank" rel="noreferrer">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Anhören
                  </a>
                </Button>
              )
            }
          />
        </TabsContent>

        <TabsContent value="presentation">
          <AssetCard
            title="Pitch-Präsentation"
            subtitle={prospect.company_name ?? ""}
            details={[]}
            actions={
              prospect.presentation_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={prospect.presentation_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Öffnen
                  </a>
                </Button>
              )
            }
          />
        </TabsContent>

        <TabsContent value="flyer">
          <AssetCard
            title="Druckfertiger Flyer"
            subtitle={prospect.company_name ?? ""}
            details={[]}
            actions={
              prospect.flyer_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={prospect.flyer_url} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Herunterladen
                  </a>
                </Button>
              )
            }
          />
        </TabsContent>

        <TabsContent value="landingpage">
          <AssetCard
            title="Landingpage"
            subtitle={prospect.company_name ?? ""}
            details={[]}
            actions={
              prospect.landing_page_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={prospect.landing_page_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Öffnen
                  </a>
                </Button>
              )
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssetCard({
  title,
  subtitle,
  details,
  actions,
}: {
  title: string;
  subtitle?: string;
  details: { label: string; value: string }[];
  actions?: ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="space-y-1 text-sm">
          {details.map((detail) => (
            <div key={detail.label} className="flex justify-between">
              <span className="text-slate-500">{detail.label}</span>
              <span className="font-medium">{detail.value}</span>
            </div>
          ))}
        </div>
        {actions || <p className="text-sm text-slate-400">Asset wird vorbereitet...</p>}
      </div>
    </Card>
  );
}
