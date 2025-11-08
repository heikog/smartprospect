import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Users,
  Globe,
  FileCheck,
  Mail,
  Sparkles,
} from "lucide-react";

export function LandingPage() {
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
            <Button variant="ghost">Preise</Button>
            <Button variant="ghost">Features</Button>
            <Button asChild>
              <Link href="/dashboard">Anmelden</Link>
            </Button>
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
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard">Kostenlos starten</Link>
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

      <section className="container mx-auto px-4 py-20">
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
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard">Jetzt kostenlos starten</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-4 text-center text-slate-600 text-sm">
          <p>© 2025 Smart Prospect. DSGVO-konform. EU-Server.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border hover:border-blue-200 hover:shadow-lg transition-all">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
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
