"use client";

import { useState } from "react";
import { Sparkles, Plus, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Campaign, CampaignStatus } from "./types";
import { CampaignList } from "./campaign-list";
import { CreateCampaign } from "./create-campaign";
import { CampaignDetail } from "./campaign-detail";

type View = "list" | "create" | "detail";

export function Dashboard() {
  const [view, setView] = useState<View>("create");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [credits, setCredits] = useState(50);
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "camp-001",
      name: "Q1 Tech Startups Berlin",
      status: "review",
      createdAt: "2025-10-28",
      prospectCount: 47,
      progress: 100,
    },
    {
      id: "camp-002",
      name: "Mittelstand Bayern - Software",
      status: "generating",
      createdAt: "2025-10-30",
      prospectCount: 152,
      progress: 67,
    },
    {
      id: "camp-003",
      name: "Enterprise DACH",
      status: "approved",
      createdAt: "2025-10-25",
      prospectCount: 23,
      progress: 100,
    },
  ]);

  const handleCreateCampaign = (campaign: Campaign) => {
    setCampaigns([campaign, ...campaigns]);
    setView("list");
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setView("detail");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedCampaign(null);
  };

  const handleBuyCredits = () => {
    setCredits((prev) => prev + 100);
    alert("Credits kaufen – Stripe Integration folgt.");
  };

  const handleStatusUpdate = (campaignId: string, status: CampaignStatus) => {
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, status } : campaign,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Smart Prospect</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setView("list")}>
              Meine Kampagnen
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {view === "list" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl mb-2 font-semibold">Kampagnen</h1>
                <p className="text-slate-600">
                  Verwalten Sie Ihre Multichannel-Outreach-Kampagnen
                </p>
              </div>
              <Button
                onClick={() => setView("create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Neue Kampagne
              </Button>
            </div>

            <CampaignList campaigns={campaigns} onSelect={handleSelectCampaign} />
          </div>
        )}

        {view === "create" && (
          <CreateCampaign
            onCancel={() => setView("list")}
            onCreate={handleCreateCampaign}
            credits={credits}
            onBuyCredits={handleBuyCredits}
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
          />
        )}

        {view === "detail" && selectedCampaign && (
          <CampaignDetail
            campaign={selectedCampaign}
            onBack={handleBackToList}
            onStatusChange={handleStatusUpdate}
          />
        )}
      </main>
    </div>
  );
}
