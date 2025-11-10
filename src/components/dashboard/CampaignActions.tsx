"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CampaignStatus } from "@/types/database";

function mutate(url: string, options: RequestInit) {
  return fetch(url, options).then((response) => {
    if (!response.ok) {
      return response.json().then((body) => {
        throw new Error(body.message ?? "Aktion fehlgeschlagen");
      });
    }
  });
}

export function CampaignActions({ campaignId, status }: { campaignId: string; status: CampaignStatus }) {
  const router = useRouter();
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(action: "review" | "send" | "delete") {
    setState(action);
    setError(null);
    try {
      if (action === "review") {
        await mutate(`/api/campaigns/${campaignId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "geprueft" }),
        });
      } else if (action === "send") {
        await mutate(`/api/campaigns/${campaignId}/dispatch`, { method: "POST" });
      } else if (action === "delete") {
        await mutate(`/api/campaigns/${campaignId}`, { method: "DELETE" });
      }
      router.refresh();
      if (action === "delete") {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setState(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "bereit_zur_pruefung" && (
          <Button onClick={() => handle("review")} disabled={state !== null}>
            {state === "review" ? "Wird markiert…" : "Geprüft OK"}
          </Button>
        )}
        {status === "geprueft" && (
          <Button onClick={() => handle("send")} disabled={state !== null}>
            {state === "send" ? "Versende…" : "Kampagne versenden"}
          </Button>
        )}
        <Button variant="ghost" className="text-rose-600" onClick={() => handle("delete")} disabled={state !== null}>
          {state === "delete" ? "Lösche…" : "Kampagne löschen"}
        </Button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
