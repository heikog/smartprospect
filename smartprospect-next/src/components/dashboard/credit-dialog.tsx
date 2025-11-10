"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const CREDIT_PACKS = [
  { credits: 50, label: "Starter", description: "Ideal für erste Kampagnen" },
  { credits: 100, label: "Scale", description: "Für wöchentliche Aussendungen" },
  { credits: 200, label: "Enterprise", description: "Für große Volumen" },
];

export function BuyCreditsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loadingPack, setLoadingPack] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (credits: number) => {
    setLoadingPack(credits);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Checkout fehlgeschlagen");
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unbekannter Fehler");
      setLoadingPack(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credits kaufen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.credits}
              className="border rounded-lg p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">
                    {pack.label} · {pack.credits} Credits
                  </p>
                  <p className="text-sm text-slate-500">{pack.description}</p>
                </div>
                <Button
                  onClick={() => startCheckout(pack.credits)}
                  disabled={loadingPack !== null}
                >
                  {loadingPack === pack.credits ? "Weiterleitung..." : "Kaufen"}
                </Button>
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Zahlungen werden sicher über Stripe abgewickelt.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
