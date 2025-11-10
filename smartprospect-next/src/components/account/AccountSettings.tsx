"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import type { CreditTransaction, Database, Profile } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BuyCreditsDialog } from "@/components/dashboard/credit-dialog";

interface AccountSettingsProps {
  profile: Profile | null;
  transactions: CreditTransaction[];
  email: string;
}

export function AccountSettings({ profile, transactions, email }: AccountSettingsProps) {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Profil gespeichert");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Account endgültig löschen? Alle Kampagnen gehen verloren.");
    if (!confirmed) return;
    setDeleting(true);
    const response = await fetch("/api/account", { method: "DELETE" });
    setDeleting(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body?.message ?? "Account konnte nicht gelöscht werden");
      return;
    }
    router.push("/?account=deleted");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <BuyCreditsDialog open={buyCreditsOpen} onOpenChange={setBuyCreditsOpen} />
      <div className="container mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Mein Account</h1>
          <p className="text-slate-600">Verwalten Sie Profil, Credits und Sicherheit.</p>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-500">E-Mail</p>
            <p className="font-medium">{email}</p>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="z.B. Max Mustermann" />
            </div>
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={saving}>
              {saving ? "Speichern..." : "Profil speichern"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Credits</h2>
              <p className="text-slate-500 text-sm">
                Verfügbar: <span className="font-semibold">{profile?.credits ?? 0}</span>
              </p>
            </div>
            <Button onClick={() => setBuyCreditsOpen(true)}>Credits kaufen</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400">
                      Noch keine Bewegungen
                    </TableCell>
                  </TableRow>
                )}
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.created_at).toLocaleString("de-DE")}</TableCell>
                    <TableCell>{tx.description ?? "—"}</TableCell>
                    <TableCell className="capitalize">{tx.type}</TableCell>
                    <TableCell className="text-right font-mono">
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <h2 className="text-xl font-semibold">Sicherheit</h2>
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={handleLogout}>
              Abmelden
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
              {deleting ? "Lösche..." : "Account löschen"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
