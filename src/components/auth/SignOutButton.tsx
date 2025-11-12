"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const supabase = useSupabaseBrowserClient();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Supabase client sign-out failed", error);
      }

      try {
        const response = await fetch("/auth/signout", { method: "POST" });
        if (!response.ok) {
          console.error("Server-side sign-out failed", await response.text());
        }
      } catch (error) {
        console.error("Failed to sync logout cookies", error);
      }

      router.replace("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="text-sm text-slate-600"
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      {isSigningOut ? "Abmelden…" : "Abmelden"}
    </Button>
  );
}
