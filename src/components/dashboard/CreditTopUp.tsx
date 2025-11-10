"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type CreditOption = {
  priceId: string;
  credits: number;
  label: string;
  highlight?: boolean;
};

export function CreditTopUp({ options }: { options: CreditOption[] }) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(priceId: string) {
    setIsLoading(priceId);
    setError(null);
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: "Unbekannter Fehler" }));
      setError(body.message ?? "Checkout konnte nicht gestartet werden");
      setIsLoading(null);
      return;
    }

    const { url } = await response.json();
    window.location.assign(url);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {options.map((option) => (
        <div
          key={option.priceId}
          className={`rounded-2xl border ${
            option.highlight ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"
          } p-4 shadow-sm`}
        >
          <p className="text-sm font-medium text-slate-500">{option.label}</p>
          <p className="text-2xl font-semibold text-slate-900">{option.credits} Credits</p>
          <Button
            className="mt-4 w-full"
            variant={option.highlight ? "primary" : "secondary"}
            onClick={() => startCheckout(option.priceId)}
            disabled={isLoading === option.priceId}
          >
            {isLoading === option.priceId ? "Weiterleiten…" : "Kaufen"}
          </Button>
        </div>
      ))}
      {error && <p className="col-span-full text-sm text-rose-600">{error}</p>}
    </div>
  );
}
