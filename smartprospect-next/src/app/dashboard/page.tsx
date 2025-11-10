import { redirect } from "next/navigation";
import { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard";
import type { Campaign, Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "Smart Prospect | Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell
      initialCampaigns={(campaigns as Campaign[]) ?? []}
      initialProfile={(profile as Profile) ?? null}
    />
  );
}
