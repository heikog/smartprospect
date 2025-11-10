"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Campaign, CampaignStatus, Prospect, Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Send, CheckCircle, Video, FileAudio, FileText, Image as ImageIcon, Globe } from "lucide-react";
import { ProspectTable } from "./prospect-table";
import { AssetPreview } from "./asset-preview";

interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
  onCampaignUpdate: (campaign: Campaign) => void;
  onRefresh: () => Promise<void> | void;
}

type CampaignEvent = { label: string; at: string };

const getEvents = (meta: Campaign["meta"]): CampaignEvent[] => {
  if (meta && typeof meta === "object" && "events" in meta) {
    const events = (meta as Record<string, unknown>).events;
    if (Array.isArray(events)) {
      return events
        .filter((event) => event && typeof event === "object" && "label" in event && "at" in event)
        .map((event) => ({
          label: String((event as Record<string, unknown>).label),
          at: String((event as Record<string, unknown>).at),
        }));
    }
  }
  return [];
};

const appendEvent = (meta: Campaign["meta"], label: string): Campaign["meta"] => {
  const events = getEvents(meta);
  return {
    ...(meta && typeof meta === "object" ? meta : {}),
    events: [...events, { label, at: new Date().toISOString() }],
  } as Campaign["meta"];
};

export function CampaignDetail({ campaign, onBack, onCampaignUpdate, onRefresh }: CampaignDetailProps) {
  const supabase = useSupabaseClient<Database>();
  const [activeTab, setActiveTab] = useState("overview");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign>(campaign);

  useEffect(() => {
    setCurrentCampaign(campaign);
  }, [campaign]);

  useEffect(() => {
    const fetchProspects = async () => {
      setLoadingProspects(true);
    const { data } = await supabase
      .from("prospects")
      .select("*")
      .eq("campaign_id", currentCampaign.id)
      .order("created_at", { ascending: true });
      setProspects((data as Prospect[]) ?? []);
      setLoadingProspects(false);
    };

    fetchProspects();
  }, [currentCampaign.id, supabase]);

  const handleStatusUpdate = async (status: CampaignStatus) => {
    setActionError(null);
    const meta = appendEvent(currentCampaign.meta, status === "approved" ? "Kampagne freigegeben" : "Status geändert");
    const { data, error } = await supabase
      .from("campaigns")
      .update({ status, meta })
      .eq("id", currentCampaign.id)
      .select()
      .single();
    if (error || !data) {
      setActionError(error?.message ?? "Status konnte nicht aktualisiert werden");
      return;
    }
    setCurrentCampaign(data as Campaign);
    onCampaignUpdate(data as Campaign);
    await onRefresh();
  };

  const handleDispatch = async () => {
    setActionError(null);
    const response = await fetch(`/api/campaigns/${currentCampaign.id}/dispatch`, {
      method: "POST",
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setActionError(body?.message ?? "Versand konnte nicht gestartet werden");
      return;
    }
    const newMeta = appendEvent(currentCampaign.meta, "Versand gestartet");
    setCurrentCampaign((prev) => ({ ...prev, status: "sent", meta: newMeta }));
    onCampaignUpdate({ ...currentCampaign, status: "sent", meta: newMeta });
    await onRefresh();
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zu Kampagnen
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold">{currentCampaign.name}</h1>
            <StatusBadge status={currentCampaign.status as CampaignStatus} />
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <div>
              <span className="text-slate-400">Prospects:</span> {currentCampaign.prospect_count}
            </div>
            <div>
              <span className="text-slate-400">Erstellt:</span> {new Date(currentCampaign.created_at).toLocaleDateString("de-DE")}
            </div>
            <div>
              <span className="text-slate-400">ID:</span> {currentCampaign.id}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {currentCampaign.status === "review" && (
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate("approved")}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Freigeben
            </Button>
          )}
          {currentCampaign.status === "approved" && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleDispatch}>
              <Send className="w-4 h-4 mr-2" />
              Versand starten
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={`/api/campaigns/${currentCampaign.id}/export`}>
              <Download className="w-4 h-4 mr-2" />
              CSV Export
            </a>
          </Button>
        </div>
      </div>

      {actionError && <p className="text-sm text-red-600 mb-4">{actionError}</p>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="preview">Vorschau</TabsTrigger>
          <TabsTrigger value="timeline">Historie</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Kampagnen-Statistiken</h3>
              <div className="space-y-4 text-sm">
                <StatRow label="Generierte Assets" value={`${currentCampaign.prospect_count * 5}`} />
                <StatRow label="Videos" value={String(currentCampaign.prospect_count)} />
                <StatRow label="Audio-Dateien" value={String(currentCampaign.prospect_count)} />
                <StatRow label="Präsentationen" value={String(currentCampaign.prospect_count)} />
                <StatRow label="Flyer (PDF)" value={String(currentCampaign.prospect_count)} />
                <StatRow label="Landingpages" value={String(currentCampaign.prospect_count)} />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Generierte Asset-Typen</h3>
              <div className="space-y-3 text-sm">
                <AssetTypeRow icon={<Video className="w-5 h-5" />} label="Personalisierte Videos" count={currentCampaign.prospect_count} />
                <AssetTypeRow icon={<FileAudio className="w-5 h-5" />} label="Audio-Botschaften" count={currentCampaign.prospect_count} />
                <AssetTypeRow icon={<FileText className="w-5 h-5" />} label="Präsentations-PDFs" count={currentCampaign.prospect_count} />
                <AssetTypeRow icon={<ImageIcon className="w-5 h-5" />} label="Druckfertige Flyer" count={currentCampaign.prospect_count} />
                <AssetTypeRow icon={<Globe className="w-5 h-5" />} label="Landingpages" count={currentCampaign.prospect_count} />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prospects">
          <ProspectTable prospects={prospects} loading={loadingProspects} />
        </TabsContent>

        <TabsContent value="assets">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: Math.min(prospects.length, 6) || 6 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                  <Video className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-sm font-medium">
                  {prospects[index]?.company_name ?? `Prospect ${index + 1}`}
                </p>
                <p className="text-xs text-slate-400">
                  {getContactName(prospects[index]?.contact)}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <AssetPreview prospects={prospects} />
        </TabsContent>

        <TabsContent value="timeline">
          <Timeline events={getEvents(currentCampaign.meta)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const config = {
    draft: { label: "Entwurf", className: "bg-slate-100 text-slate-700" },
    generating: { label: "In Bearbeitung", className: "bg-blue-100 text-blue-700" },
    review: { label: "Prüfung", className: "bg-yellow-100 text-yellow-700" },
    approved: { label: "Freigegeben", className: "bg-green-100 text-green-700" },
    sent: { label: "Versendet", className: "bg-slate-100 text-slate-700" },
  }[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function AssetTypeRow({ icon, label, count }: { icon: ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="text-blue-600">{icon}</div>
        <span>{label}</span>
      </div>
      <Badge variant="secondary">{count}</Badge>
    </div>
  );
}

function Timeline({ events }: { events: CampaignEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">Noch keine Aktivitäten protokolliert.</p>;
  }
  return (
    <div className="space-y-4">
      {events
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .map((event) => (
          <div key={`${event.label}-${event.at}`} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{event.label}</p>
              <p className="text-xs text-slate-500">{new Date(event.at).toLocaleString("de-DE")}</p>
            </div>
          </div>
        ))}
    </div>
  );
}

function getContactName(contact: Prospect["contact"]): string | undefined {
  if (contact && typeof contact === "object" && "name" in contact) {
    const value = (contact as Record<string, unknown>).name;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}
