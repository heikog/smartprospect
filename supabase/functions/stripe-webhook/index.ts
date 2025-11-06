/**
 * Stripe Webhook Edge Function
 * Handles checkout.session.completed events to credit user accounts
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12?target=deno';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' })
  : null;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  if (!stripe || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('[StripeWebhook] Missing configuration');
    return new Response('Server misconfiguration', { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.warn('[StripeWebhook] Missing signature header');
    return new Response('Bad request', { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('[StripeWebhook] Signature verification failed', error);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const profileId = session.metadata?.profile_id ?? null;
        const credits = Number.parseInt(session.metadata?.credits ?? '0', 10);

        if (!profileId || !Number.isFinite(credits) || credits <= 0) {
          console.warn('[StripeWebhook] Missing profile metadata or invalid credit amount', session.id);
          break;
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Idempotency check – ensure we haven't processed this event before
        const { data: existing, error: existingError } = await supabase
          .from('credit_ledger')
          .select('id')
          .eq('profile_id', profileId)
          .contains('meta', { stripe_event_id: event.id })
          .maybeSingle();

        if (existingError) {
          console.error('[StripeWebhook] Ledger lookup failed', existingError);
          throw existingError;
        }

        if (existing) {
          console.log('[StripeWebhook] Event already processed', event.id);
          break;
        }

        const meta = {
          stripe_event_id: event.id,
          checkout_session_id: session.id,
          price_key: session.metadata?.price_key ?? null,
        };

        const { error: creditError } = await supabase.rpc('add_profile_credits', {
          p_profile_id: profileId,
          p_amount: credits,
          p_reason: 'stripe_purchase',
          p_meta: meta,
        });

        if (creditError) {
          console.error('[StripeWebhook] Failed to credit profile', creditError);
          throw creditError;
        }

        console.log('[StripeWebhook] Credited profile', profileId, 'with', credits, 'credits');
        break;
      }
      default: {
        console.log('[StripeWebhook] Event ignored', event.type);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[StripeWebhook] Handler error', error);
    return new Response('Internal server error', { status: 500 });
  }
});

