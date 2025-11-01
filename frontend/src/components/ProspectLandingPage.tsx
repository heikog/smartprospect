import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Phone, Mail, Play, Pause, Volume2, CheckCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export interface ProspectData {
  id: string;
  anrede: string;
  vorname: string;
  nachname: string;
  stadt: string;
  url: string;
}

interface ProspectLandingPageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospect: ProspectData;
}

export function ProspectLandingPage({ open, onOpenChange, prospect }: ProspectLandingPageProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Personalisierte Prospect-Landingpage</DialogTitle>
        </DialogHeader>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <ProspectLandingExperience prospect={prospect} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProspectLandingExperience({ prospect }: { prospect: ProspectData }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      alert(`Vielen Dank! Wir melden uns bei Ihnen: ${email} / ${phone}`);
    }, 1500);
  };

  const toggleAudio = () => {
    setAudioPlaying((prev) => !prev);
    // In echter Implementierung würde hier Audio abgespielt bzw. pausiert
  };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl mb-4">
            {prospect.anrede === 'Frau' ? 'Liebe' : 'Lieber'} {prospect.anrede} {prospect.nachname},
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            wir haben speziell für Sie und Ihr Unternehmen eine personalisierte Lösung entwickelt, die Ihre B2B-Vertriebsprozesse
            revolutionieren wird.
          </p>
        </div>
      </div>

      <div className="px-12 py-10 max-w-4xl mx-auto">
        {/* Pitch Section */}
        <div className="mb-12">
          <h2 className="text-3xl mb-4 text-slate-900">Automatisierte Multichannel-Kampagnen für {prospect.stadt}</h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            Smart Prospect ermöglicht es Ihnen, in wenigen Minuten vollständig personalisierte B2B-Kampagnen zu erstellen. Erreichen
            Sie Ihre Zielkunden mit Avatar-Videos, individualisierten Landingpages und professionellen Flyern – alles automatisch
            generiert und auf Ihre Prospects zugeschnitten.
          </p>
        </div>

        {/* Avatar Video Section */}
        <Card className="p-8 mb-12 bg-slate-50">
          <h3 className="text-2xl mb-4 text-slate-900">Persönliche Begrüßung für Sie</h3>
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg relative overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-white/30 transition-colors cursor-pointer">
                  <Play className="w-12 h-12 text-white ml-2" />
                </div>
                <p className="text-white text-sm">Avatar Video abspielen</p>
                <p className="text-white/60 text-xs mt-2">
                  Speziell für {prospect.vorname} {prospect.nachname} erstellt
                </p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded text-sm">2:34</div>
          </div>
          <p className="text-sm text-slate-600 mt-4 text-center">🎬 Personalisiertes Avatar-Video mit Heygen erstellt</p>
        </Card>

        {/* Presentation Section */}
        <Card className="p-8 mb-12">
          <h3 className="text-2xl mb-4 text-slate-900">Ihre individuelle Präsentation</h3>
          <div className="aspect-[16/10] bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 p-8">
              <div className="bg-white rounded-lg shadow-2xl h-full p-8 flex flex-col">
                <div className="mb-4">
                  <div className="h-3 bg-blue-600 rounded w-3/4 mb-3" />
                  <div className="h-2 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-2 bg-slate-200 rounded w-5/6" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-100 rounded" />
                  <div className="bg-slate-100 rounded" />
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-slate-300'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" className="mr-2">
              <Play className="w-4 h-4 mr-2" />
              Präsentation ansehen
            </Button>
            <p className="text-sm text-slate-600 mt-3">📊 Mit Gamma.app für Ihr Unternehmen erstellt</p>
          </div>
        </Card>

        {/* Audio/Podcast Section */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-orange-50 to-amber-50">
          <h3 className="text-2xl mb-4 text-slate-900">Ihr persönlicher Audio-Pitch</h3>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAudio}
                className="w-14 h-14 bg-orange-600 hover:bg-orange-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                {audioPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-orange-600 transition-all duration-300 ${audioPlaying ? 'w-1/3' : 'w-0'}`}
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Smart Prospect Lösung für {prospect.vorname} {prospect.nachname}
                </p>
              </div>
              <div className="text-sm text-slate-500">3:42</div>
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-4 text-center">🎙️ Professionelle Audio-Nachricht mit ElevenLabs</p>
        </Card>

        {/* Call to Action Section */}
        <Card className="p-10 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <h3 className="text-3xl mb-3 text-slate-900">Lassen Sie uns sprechen!</h3>
                <p className="text-lg text-slate-700">
                  Interessiert an einer personalisierten Demo für Ihr Unternehmen in {prospect.stadt}? Hinterlassen Sie uns Ihre
                  Kontaktdaten und wir melden uns innerhalb von 24 Stunden.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="email" className="text-base">
                    E-Mail-Adresse *
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ihre.email@beispiel.de"
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base">
                    Telefonnummer *
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+49 123 456789"
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base bg-green-600 hover:bg-green-700">
                  Jetzt Kontakt aufnehmen
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  Wir respektieren Ihre Privatsphäre und geben Ihre Daten nicht weiter.
                </p>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl mb-2 text-slate-900">Vielen Dank, {prospect.vorname}!</h3>
              <p className="text-lg text-slate-700">Wir haben Ihre Anfrage erhalten und melden uns in Kürze bei Ihnen.</p>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Diese Seite wurde speziell für <span className="text-slate-900">{prospect.vorname} {prospect.nachname}</span> erstellt
          </p>
          <p className="text-xs text-slate-400 mt-2">Powered by Smart Prospect – Automatisierte B2B-Kampagnen</p>
        </div>
      </div>
    </div>
  );
}

