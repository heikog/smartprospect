/**
 * Create Checkout Session Edge Function
 * Creates a Stripe Checkout Session for purchasing Pitch Credits
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type BundleKey = 'credits_50' | 'credits_100' | 'credits_200';

const bundleConfig: Record<BundleKey, { envKey: string; credits: number }> = {
  credits_50: { envKey: 'STRIPE_PRICE_ID_CREDITS_50', credits: 50 },
  credits_100: { envKey: 'STRIPE_PRICE_ID_CREDITS_100', credits: 100 },
  credits_200: { envKey: 'STRIPE_PRICE_ID_CREDITS_200', credits: 200 },
};

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: '2023-10-16',
    })
  : null;

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const appUrl = Deno.env.get('APP_URL') ?? 'https://smartprospect.app';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!stripe || !supabaseUrl || !supabaseServiceKey) {
    console.error('[CheckoutSession] Missing required environment variables');
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('[CheckoutSession] Auth error', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const bundleKey = (body?.bundle ?? '') as string;

    if (!['credits_50', 'credits_100', 'credits_200'].includes(bundleKey)) {
      return new Response(
        JSON.stringify({ error: 'Ungültiges Credit-Paket' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = bundleConfig[bundleKey as BundleKey];
    const priceId = Deno.env.get(config.envKey);

    if (!priceId) {
      console.error('[CheckoutSession] Missing price configuration for bundle', bundleKey);
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${appUrl}/dashboard?checkout=success&bundle=${bundleKey}`,
      cancel_url: `${appUrl}/dashboard?checkout=cancel`,
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        profile_id: user.id,
        credits: String(config.credits),
        price_key: bundleKey,
      },
    });

    console.log('[CheckoutSession] Session created', session.id, 'for bundle', bundleKey);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[CheckoutSession] Unexpected error', error);
    return new Response(
      JSON.stringify({ error: 'Checkout konnte nicht gestartet werden' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

