import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProspectLandingExperience, type ProspectData } from '../components/ProspectLandingPage';
import { getProspect } from '../services/campaigns';
import { Button } from '../components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

type ViewState = 'loading' | 'ready' | 'not-found' | 'error';

export function ProspectPreviewPage() {
  const { campaignId, prospectId } = useParams<{ campaignId: string; prospectId: string }>();
  const [prospect, setProspect] = useState<ProspectData | null>(null);
  const [state, setState] = useState<ViewState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId || !prospectId) {
      setState('error');
      setErrorMessage('Ungültige URL – Kampagnen- oder Prospect-ID fehlt.');
      return;
    }

    let active = true;
    const load = async () => {
      try {
        setState('loading');
        const data = await getProspect(campaignId, prospectId);
        if (!active) return;

        if (!data) {
          setState('not-found');
          return;
        }

        setProspect(mapProspect(data));
        setState('ready');
      } catch (error) {
        console.error('Fehler beim Laden der Prospect Landingpage', error);
        if (!active) return;
        setProspect(createDemoProspect(prospectId));
        setErrorMessage('Live-Daten nicht verfügbar. Demo-Version wird angezeigt.');
        setState('ready');
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [campaignId, prospectId]);

  const content = useMemo(() => {
    switch (state) {
      case 'loading':
        return <p className="text-slate-500 text-center mt-16">Landingpage wird geladen …</p>;
      case 'not-found':
        return (
          <StateError
            title="Landingpage nicht gefunden"
            message="Für die angegebene Kampagnen-/Prospect-Kombination existiert derzeit keine Landingpage."
          />
        );
      case 'ready':
        return prospect ? (
          <ProspectLandingExperience prospect={prospect} />
        ) : (
          <StateError title="Landingpage nicht gefunden" message="Die Inhalte konnten nicht angezeigt werden." />
        );
      case 'error':
        return <StateError title="Fehler beim Laden" message={errorMessage ?? 'Unbekannter Fehler aufgetreten.'} />;
      default:
        return null;
    }
  }, [errorMessage, prospect, state]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Smart Prospect – Personalisierte Landingpage</h1>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
          </Link>
        </div>
      </header>

      <main className="min-h-[calc(100vh-80px)] bg-white">
        {state === 'ready' ? (
          <>
            {errorMessage && (
              <div className="bg-amber-50 border-b border-amber-200 text-amber-700 text-sm px-4 py-3 text-center">
                {errorMessage}
              </div>
            )}
            {content}
          </>
        ) : (
          <div className="container mx-auto px-4 py-20 flex justify-center">{content}</div>
        )}
      </main>
    </div>
  );
}

function mapProspect(record: NonNullable<Awaited<ReturnType<typeof getProspect>>>): ProspectData {
  return {
    id: record.id,
    anrede: record.anrede,
    vorname: record.vorname,
    nachname: record.nachname,
    stadt: record.stadt,
    url: record.url
  };
}

function StateError({ title, message }: { title: string; message: string }) {
  return (
    <div className="max-w-lg text-center space-y-4">
      <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

function createDemoProspect(prospectId: string): ProspectData {
  return {
    id: prospectId,
    anrede: 'Herr',
    vorname: 'Demo',
    nachname: 'Kontakt',
    stadt: 'Berlin',
    url: 'https://example.com'
  };
}
