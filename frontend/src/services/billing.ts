import { supabase } from '../lib/supabase';
import { env } from '../lib/env';

const EDGE_BASE_URL = `${env.supabaseUrl}/functions/v1`;

export type CreditBundleKey = 'credits_50' | 'credits_100' | 'credits_200';

export async function startCreditCheckout(bundle: CreditBundleKey): Promise<{ url: string }> {
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    throw new Error('Keine aktive Session – bitte erneut anmelden.');
  }

  const response = await fetch(`${EDGE_BASE_URL}/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.data.session.access_token}`,
    },
    body: JSON.stringify({ bundle }),
  });

  if (!response.ok) {
    let message = 'Checkout konnte nicht gestartet werden.';
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // ignore json parse errors
    }
    throw new Error(message);
  }

  const data = await response.json();
  if (!data?.url) {
    throw new Error('Unerwartete Antwort vom Checkout-Service.');
  }
  return data;
}

