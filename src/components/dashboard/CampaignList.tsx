"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { CampaignStatus } from "@/types/database";

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  row_count: number;
  last_status_change: string;
  created_at: string;
  generation_job_id: string | null;
  send_job_id: string | null;
};

const statusLabel: Record<CampaignStatus, string> = {
  in_erstllg: "In Erstellung",
  bereit_zur_pruefung: "Bereit zur Prüfung",
  geprueft: "Geprüft",
  versandt: "Versandt",
};

type LoadingState = null | { id: string; action: "review" | "send" | "delete" };

async function request(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Fehler" }));
    throw new Error(payload.message ?? "Aktion fehlgeschlagen");
  }
  return response.json().catch(() => ({}));
}

export function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<LoadingState>(null);
  const [error, setError] = useState<string | null>(null);

  async function mutate(id: string, action: LoadingState["action"], fetcher: () => Promise<unknown>) {
    setLoading({ id, action });
    setError(null);
    try {
      await fetcher();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(null);
    }
  }

  if (!campaigns.length) {
    return (
      <Card className="text-center text-slate-500">
        Noch keine Kampagnen. Lege deine erste Kampagne an, um Credits zu nutzen.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
              <Badge variant={campaign.status}>{statusLabel[campaign.status]}</Badge>
            </div>
            <p className="text-sm text-slate-500">
              {campaign.row_count} Prospects · zuletzt aktualisiert {formatDate(campaign.last_status_change)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/campaigns/${campaign.id}`}>
              <Button type="button" variant="secondary">
                Details
              </Button>
            </Link>
            {campaign.status === "bereit_zur_pruefung" && (
              <Button
                type="button"
                onClick={() =>
                  mutate(campaign.id, "review", () =>
                    request(`/api/campaigns/${campaign.id}/status`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "geprueft" }),
                    }),
                  )
                }
                disabled={loading?.id === campaign.id}
              >
                {loading?.id === campaign.id && loading.action === "review"
                  ? "Markiere…"
                  : "Geprüft OK"}
              </Button>
            )}
            {campaign.status === "geprueft" && (
              <Button
                type="button"
                onClick={() =>
                  mutate(campaign.id, "send", () =>
                    request(`/api/campaigns/${campaign.id}/dispatch`, { method: "POST" }),
                  )
                }
                disabled={loading?.id === campaign.id}
              >
                {loading?.id === campaign.id && loading.action === "send"
                  ? "Sende…"
                  : "Kampagne versenden"}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="text-rose-600"
              onClick={() =>
                mutate(campaign.id, "delete", () =>
                  request(`/api/campaigns/${campaign.id}`, { method: "DELETE" }),
                )
              }
              disabled={loading?.id === campaign.id}
            >
              {loading?.id === campaign.id && loading.action === "delete" ? "Lösche…" : "Löschen"}
            </Button>
          </div>
        </Card>
      ))}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
