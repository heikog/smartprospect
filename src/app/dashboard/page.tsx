import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateCampaignForm } from "@/components/dashboard/CreateCampaignForm";
import { CampaignList } from "@/components/dashboard/CampaignList";
import { CreditTopUp } from "@/components/dashboard/CreditTopUp";
import type { Tables } from "@/types/database";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: creditBalance }, { data: campaigns }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_credit_balances").select("credits").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("campaigns")
      .select("id,name,status,row_count,last_status_change,created_at,generation_job_id,send_job_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const credits = creditBalance?.credits ?? 0;
  const campaignItems = (campaigns ?? []) as Array<
    Pick<Tables<"campaigns">, "id" | "name" | "status" | "row_count" | "last_status_change" | "created_at" | "generation_job_id" | "send_job_id">
  >;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader email={profile?.email ?? user.email} credits={credits} />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Verfügbare Credits</p>
                <p className="text-4xl font-semibold text-slate-900">{credits}</p>
              </div>
              <Button asChild>
                <a href="#credits">Credits kaufen</a>
              </Button>
            </div>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Excel-Vorlage</p>
            <a
              href={env.EXCEL_TEMPLATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600"
            >
              Download starten →
            </a>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900">Neue Kampagne</h2>
            <p className="text-sm text-slate-500">Upload Excel/CSV (Pflichtspalten) & Service-PDF. Credits werden automatisch abgezogen.</p>
            <div className="mt-6">
              <CreateCampaignForm excelTemplateUrl={env.EXCEL_TEMPLATE_URL} />
            </div>
          </Card>
        </section>

        <section className="space-y-4" id="campaigns">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Kampagnen</h2>
            <p className="text-sm text-slate-500">Status-Updates kommen automatisch über die n8n Callbacks.</p>
          </div>
          <CampaignList campaigns={campaignItems} />
        </section>

        <section className="space-y-4" id="credits">
          <h2 className="text-xl font-semibold text-slate-900">Credits aufladen</h2>
          <CreditTopUp
            options={[
              {
                priceId: env.STRIPE_PRICE_CREDITS_5,
                credits: 5,
                label: "Starter",
              },
              {
                priceId: env.STRIPE_PRICE_CREDITS_50,
                credits: 50,
                label: "Scale",
                highlight: true,
              },
              {
                priceId: env.STRIPE_PRICE_CREDITS_500,
                credits: 500,
                label: "Enterprise",
              },
            ]}
          />
        </section>
      </main>
    </div>
  );
}
