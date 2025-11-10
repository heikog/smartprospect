import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AccountSettings } from "@/components/account/AccountSettings";
import type { CreditTransaction, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/?auth=login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  return (
    <AccountSettings
      profile={(profile as Profile) ?? null}
      transactions={(transactions as CreditTransaction[]) ?? []}
      email={session.user.email ?? ""}
    />
  );
}
