import Link from "next/link";
import { env } from "@/lib/env";

const highlights = [
  {
    title: "Supabase Magic Link Login",
    description: "Onboarding ohne Passwort inkl. Starter-Credits & Profilverwaltung.",
  },
  {
    title: "Kampagnen Orchestrierung",
    description:
      "Uploads werden direkt an n8n weitergereicht, Statuswechsel erfolgen automatisch über Callbacks.",
  },
  {
    title: "Stripe Credits",
    description: "Credits kaufen via Checkout & Webhook – 1 Credit entspricht genau einem Prospect.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
        <div className="space-y-6 text-center">
          <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Smart Prospect MVP
          </span>
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Personalisierte Offline-Flyer aus einer App heraus
          </h1>
          <p className="text-lg text-slate-600 md:text-xl">
            Lade Excel-Listen & Service-PDFs hoch, wir kümmern uns um QR-Codes, Landingpages und den Versand über
            n8n. Credits, Auth, Storage & n8n-Orchestrierung sind fix und fertig integriert.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
            >
              Jetzt anmelden
            </Link>
            <a
              href={env.EXCEL_TEMPLATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-slate-700 hover:bg-white"
            >
              Excel-Vorlage herunterladen
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">End-to-End Prozess</h2>
          <ol className="mt-6 space-y-4 text-slate-700">
            <li>
              <strong className="text-slate-900">1. Anmeldung:</strong> Magic Link Login via Supabase → 5 Credits Startguthaben.
            </li>
            <li>
              <strong className="text-slate-900">2. Upload & Generierung:</strong> Kampagne anlegen, Excel/PDF hochladen, n8n Workflow #1 erzeugt Assets & ruft Callback.
            </li>
            <li>
              <strong className="text-slate-900">3. Prüfung:</strong> Assets werden direkt im Dashboard kontrolliert, Statuswechsel per Klick.
            </li>
            <li>
              <strong className="text-slate-900">4. Versand:</strong> Freigabe triggert n8n Workflow #2, Druck & Versand werden bestätigt.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
