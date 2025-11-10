"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateCampaignForm({ excelTemplateUrl }: { excelTemplateUrl: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invalidRowCount, setInvalidRowCount] = useState<number | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setInvalidRowCount(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/campaigns", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: "Fehler" }));
      setError(payload.message ?? "Kampagne konnte nicht angelegt werden");
      setIsSubmitting(false);
      return;
    }

    const payload = await response.json();
    if (typeof payload.invalidRowCount === "number" && payload.invalidRowCount > 0) {
      setInvalidRowCount(payload.invalidRowCount);
    }
    setStatus("Kampagne angelegt. n8n erstellt jetzt die Assets.");
    setName("");
    (event.target as HTMLFormElement).reset();
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
      <div className="space-y-2">
        <Label htmlFor="name">Kampagnenname</Label>
        <Input
          id="name"
          name="name"
          placeholder="z. B. Herbst-Aktion Berlin"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="prospects">
            Prospect Excel/CSV <span className="text-slate-400">(Vorlage erforderlich)</span>
          </Label>
          <Input id="prospects" name="prospects" type="file" accept=".csv,.xlsx,.xlsm,.xls" required />
          <a
            href={excelTemplateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline"
          >
            Beispiel-Excel herunterladen
          </a>
        </div>
        <div className="space-y-2">
          <Label htmlFor="servicePdf">Service-PDF</Label>
          <Input id="servicePdf" name="servicePdf" type="file" accept="application/pdf" required />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Wird angelegt…" : "Kampagne erstellen"}
      </Button>
      {status && <p className="text-sm text-emerald-600">{status}</p>}
      {invalidRowCount !== null && invalidRowCount > 0 && (
        <p className="text-sm text-amber-600">
          {invalidRowCount} Zeilen wurden aufgrund fehlender Pflichtfelder übersprungen.
        </p>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  );
}
