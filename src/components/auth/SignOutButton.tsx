"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const supabase = useSupabaseBrowserClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      className="text-sm text-slate-600"
      onClick={() =>
        startTransition(async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        })
      }
      disabled={isPending}
    >
      {isPending ? "Abmelden…" : "Abmelden"}
    </Button>
  );
}
