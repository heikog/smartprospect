import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function SignInPage() {
  const { signInWithEmail, session } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      const redirectState = (location.state as { redirectTo?: string } | null) ?? null;
      const redirectTo = redirectState?.redirectTo ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [session, navigate, location]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage(null);
    const result = await signInWithEmail(email);
    if (result && 'error' in result) {
      setStatus('error');
      setErrorMessage(result.error ?? 'Unbekannter Fehler');
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">Anmeldung</h1>
        <p className="text-sm text-slate-600 mb-6">
          Gib deine E-Mail-Adresse ein. Wir senden dir einen Magic Link zur Anmeldung.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Link wird gesendet…' : 'Magic Link senden'}
          </button>
        </form>
        {status === 'sent' && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            Prüfe deine E-Mails und öffne den Link, um dich anzumelden.
          </div>
        )}
        {status === 'error' && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {errorMessage ?? 'Beim Versenden des Links ist ein Fehler aufgetreten.'}
          </div>
        )}
        <div className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="text-blue-600 hover:underline">
            Zurück zur Landingpage
          </Link>
        </div>
      </div>
    </div>
  );
}
