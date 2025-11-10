"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Users,
  Globe,
  FileCheck,
  Mail,
  Sparkles,
  LogOut,
} from "lucide-react";
import type { Database } from "@/types/database";

export function LandingPage() {
  const session = useSession();
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("pending");
    setErrorMessage(null);
    const redirectTo =
      (process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin) +
      "/auth/callback?next=/dashboard";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Smart Prospect</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("#pricing")}>
              Preise
            </Button>
            <Button variant="ghost" onClick={() => router.push("#features")}>
              Features
            </Button>
            {session ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/account">Account</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link href="#signin">Anmelden</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
            <Sparkles className="w-4 h-4" />
            KI-gestützte Multichannel-Kampagnen
          </div>

          <h1 className="text-5xl lg:text-6xl bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">
            Automatisierte, personalisierte B2B-Outreach-Kampagnen
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Erstellen Sie in wenigen Minuten vollständig personalisierte Kampagnen mit
            Videos, Audio-Botschaften, Präsentationen und Flyern – für jeden einzelnen Prospect.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push(session ? "/dashboard" : "#signin")}
            >
              {session ? "Zum Dashboard" : "Kostenlos starten"}
            </Button>
            <Button size="lg" variant="outline">
              Demo ansehen
            </Button>
          </div>

          <div className="pt-8 text-sm text-slate-500">
            ✓ Keine Kreditkarte erforderlich · ✓ DSGVO-konform · ✓ 5 Minuten Setup
          </div>
        </div>
      </section>

      {!session && (
        <section id="signin" className="container mx-auto px-4 py-16">
          <div className="max-w-xl mx-auto bg-white border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-center">Magic Link erhalten</h2>
            <p className="text-slate-600 text-center mb-6">
              Wir senden Ihnen einen sicheren One-Click-Link. Kein Passwort nötig.
            </p>
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <label htmlFor="email" className="text-sm text-slate-600">
                  Geschäftliche E-Mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@company.com"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                disabled={status === "pending"}
              >
                {status === "pending" ? "Link wird gesendet..." : "Magic Link anfordern"}
              </Button>
            </form>
            {status === "sent" && (
              <p className="text-sm text-green-600 text-center mt-4">
                Bitte prüfen Sie Ihr Postfach – der Link ist nur wenige Minuten gültig.
              </p>
            )}
            {status === "error" && errorMessage && (
              <p className="text-sm text-red-600 text-center mt-4">{errorMessage}</p>
            )}
          </div>
        </section>
      )}

      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4">
            Alles was Sie für erfolgreiches B2B-Prospecting brauchen
          </h2>
          <p className="text-slate-600">Eine Plattform, unbegrenzte Möglichkeiten</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Personalisierte Videos"
            description="KI-generierte Avatar-Videos für jeden Prospect mit individueller Ansprache"
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8" />}
            title="Individuelle Landingpages"
            description="Jeder Kontakt erhält eine maßgeschneiderte Landingpage mit QR-Code"
          />
          <FeatureCard
            icon={<FileCheck className="w-8 h-8" />}
            title="Druckfertige Flyer"
            description="Automatisch generierte, personalisierte PDF-Flyer bereit für den Druck"
          />
          <FeatureCard
            icon={<Mail className="w-8 h-8" />}
            title="Audio-Botschaften"
            description="Professionelle Sprachaufnahmen mit ElevenLabs AI"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Pitch-Präsentationen"
            description="Individuelle Präsentations-PDFs für jeden Prospect"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Multichannel-Ansatz"
            description="Kombination aus haptischem Mailing und Digital-Content"
          />
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">So einfach funktioniert&apos;s</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <StepCard
              number="1"
              title="Excel-Liste hochladen"
              description="Laden Sie Ihre Prospect-Liste und Service-PDFs hoch"
            />
            <StepCard
              number="2"
              title="KI generiert alle Assets"
              description="Für jeden Kontakt: Video, Audio, Präsentation, Flyer & Landingpage"
            />
            <StepCard
              number="3"
              title="Qualitätsprüfung"
              description="Prüfen Sie Stichproben und geben Sie die Kampagne frei"
            />
            <StepCard
              number="4"
              title="Versand starten"
              description="PDFs direkt an Druckpartner, Landingpages sind live"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl mb-4">Bereit für Ihre erste Kampagne?</h2>
          <p className="text-xl mb-8 text-blue-50">
            Erstellen Sie in 5 Minuten eine vollständig personalisierte Multichannel-Kampagne
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push(session ? "/dashboard" : "#signin")}
          >
            {session ? "Weiter im Dashboard" : "Jetzt kostenlos starten"}
          </Button>
        </div>
      </section>

      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-2">Preise & Pakete</h2>
          <p className="text-slate-500">Transparente Credits – zahlen Sie nur, was Sie nutzen.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <PricingCard
            title="Starter"
            price="50 Credits"
            description="Einmaliger Versand an bis zu 50 Prospects"
            features={["1 Kampagne", "Alle Asset-Typen", "E-Mail Support"]}
          />
          <PricingCard
            title="Scale"
            price="100 Credits"
            description="Für wöchentliche Aussendungen"
            highlight
            features={["Mehrere Kampagnen", "Team-Zugriff", "Priorisierter Support"]}
          />
          <PricingCard
            title="Enterprise"
            price="200 Credits"
            description="Große Listen & White-Label"
            features={["SLA & Custom-Flows", "Webhook-Integration", "Onboarding-Support"]}
          />
        </div>
      </section>

      <section id="faq" className="bg-slate-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-semibold mb-8 text-center">FAQ</h2>
          <div className="space-y-6">
            <FaqItem
              question="Welche Dateien benötige ich?"
              answer="Eine Prospect-Liste (Excel/CSV) mit Adressdaten sowie ein Service-/Produkt-PDF. Optional können weitere Assets über n8n angebunden werden."
            />
            <FaqItem
              question="Wie lange dauert die Generierung?"
              answer="Je nach Länge der Liste wenige Minuten bis ca. eine Stunde. Du siehst den Fortschritt live und entscheidest, wann freigegeben wird."
            />
            <FaqItem
              question="Kann ich meine Daten löschen?"
              answer="Ja. Über die Account-Seite kannst du jederzeit dein Profil oder einzelne Kampagnen löschen."
            />
          </div>
        </div>
      </section>

      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-4 text-center text-slate-600 text-sm space-y-2">
          <p>© {new Date().getFullYear()} Smart Prospect. DSGVO-konform. EU-Server.</p>
          <p>
            Support: <a className="text-blue-600" href="mailto:support@smartprospect.ai">support@smartprospect.ai</a> ·
            <Link className="text-blue-600" href="#faq">FAQ</Link> ·
            <Link className="text-blue-600" href="#pricing">Preise</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border hover:border-blue-200 hover:shadow-lg transition-all">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-lg font-semibold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({ title, price, description, features, highlight }: { title: string; price: string; description: string; features: string[]; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 flex flex-col gap-4 ${highlight ? "border-blue-500 shadow-lg" : "border-slate-200"}`}>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-3xl font-semibold">{price}</p>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <ul className="text-sm text-slate-600 space-y-2">
        {features.map((feature) => (
          <li key={feature}>• {feature}</li>
        ))}
      </ul>
      <Button className="mt-auto" variant={highlight ? "default" : "outline"}>
        Angebot sichern
      </Button>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <p className="font-semibold mb-1">{question}</p>
      <p className="text-sm text-slate-600">{answer}</p>
    </div>
  );
}
