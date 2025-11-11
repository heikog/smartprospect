"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSupabaseBrowserClient } from "@/lib/supabase/browser";

export function MagicLinkForm({ redirectTo }: { redirectTo: string }) {
  const supabase = useSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setStatus("Magic Link verschickt – bitte Posteingang prüfen");
    }

    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Geschäftliche E-Mail</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Wird gesendet…" : "Magic Link senden"}
      </Button>
      {status && <p className="text-sm text-emerald-600">{status}</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  );
}
