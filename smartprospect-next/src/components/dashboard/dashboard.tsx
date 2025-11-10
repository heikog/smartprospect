"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, Plus, LogOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

import { Button } from "@/components/ui/button";
import { CampaignList } from "./campaign-list";
import { CreateCampaign } from "./create-campaign";
import { CampaignDetail } from "./campaign-detail";
import type { Campaign, Profile, Database } from "@/types/database";

type View = "list" | "create" | "detail";

interface DashboardShellProps {
  initialCampaigns: Campaign[];
  initialProfile: Profile | null;
}

export function DashboardShell({ initialCampaigns, initialProfile }: DashboardShellProps) {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabaseClient<Database>();
  const [view, setView] = useState<View>(initialCampaigns.length ? "list" : "create");
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<"success" | "cancel" | null>(null);

  useEffect(() => {
    const status = searchParams.get("checkout");
    if (status === "success" || status === "cancel") {
      setCheckoutStatus(status);
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  const refreshProfile = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    if (data) setProfile(data as Profile);
  }, [session, supabase]);

  const refreshCampaigns = useCallback(async () => {
    setIsRefreshing(true);
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCampaigns(data as Campaign[]);
    setIsRefreshing(false);
  }, [supabase]);

  const handleCreateCampaign = (campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
    setView("list");
    refreshProfile();
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setView("detail");
  };

  const handleBackToList = () => {
    setSelectedCampaign(null);
    setView("list");
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    const confirmed = window.confirm("Kampagne wirklich löschen? Alle Assets gehen verloren.");
    if (!confirmed) return;

    const response = await fetch(`/api/campaigns/${campaignId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      alert(body?.message ?? "Löschen fehlgeschlagen");
      return;
    }

    setCampaigns((prev) => prev.filter((campaign) => campaign.id !== campaignId));
    if (selectedCampaign?.id === campaignId) {
      handleBackToList();
    }
    await refreshProfile();
  };

  const handleCampaignUpdate = (updated: Campaign) => {
    setCampaigns((prev) =>
      prev.map((campaign) => (campaign.id === updated.id ? updated : campaign)),
    );
    setSelectedCampaign(updated);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
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
            <Button variant="ghost" size="sm" onClick={() => setView("list")} disabled={isRefreshing}>
              {isRefreshing ? "Aktualisiere..." : "Meine Kampagnen"}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/account">Account</a>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {checkoutStatus && (
          <div
            className={`rounded-lg border p-4 ${
              checkoutStatus === "success"
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-amber-300 bg-amber-50 text-amber-800"
            }`}
          >
            {checkoutStatus === "success"
              ? "Zahlung erfolgreich – Credits wurden gutgeschrieben."
              : "Checkout abgebrochen. Du kannst es jederzeit erneut versuchen."}
          </div>
        )}
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

            <CampaignList
              campaigns={campaigns}
              onSelect={handleSelectCampaign}
              onDelete={handleDeleteCampaign}
            />
          </div>
        )}

        {view === "create" && profile && (
          <CreateCampaign
            profile={profile}
            onCancel={() => setView("list")}
            onCreate={handleCreateCampaign}
            onProfileRefresh={refreshProfile}
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
          />
        )}

        {view === "detail" && selectedCampaign && (
          <CampaignDetail
            campaign={selectedCampaign}
            onBack={handleBackToList}
            onCampaignUpdate={handleCampaignUpdate}
            onRefresh={refreshCampaigns}
          />
        )}
      </main>
    </div>
  );
}
