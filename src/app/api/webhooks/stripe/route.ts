import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, getCreditsForPrice } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return new NextResponse(`Webhook error: ${(error as Error).message}`, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const serializedEvent = JSON.parse(JSON.stringify(event)) as Json;
  await supabase
    .from("stripe_webhook_events")
    .upsert(
      [
        {
          stripe_event_id: event.id,
          type: event.type,
          livemode: event.livemode ?? null,
          raw_payload: serializedEvent,
        },
      ],
      { onConflict: "stripe_event_id" },
    );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const priceId = session.metadata?.price_id ?? undefined;
    const creditsFromMetadata = session.metadata?.credit_quantity
      ? Number(session.metadata.credit_quantity)
      : undefined;
    const creditQuantity = creditsFromMetadata ?? getCreditsForPrice(priceId ?? null);

    if (!userId || !priceId || !creditQuantity) {
      return new NextResponse("Missing metadata on checkout session", { status: 400 });
    }

    const serializedSession = JSON.parse(JSON.stringify(session)) as Json;

    await supabase.rpc("apply_checkout_credit", {
      p_user_id: userId,
      p_stripe_session_id: session.id,
      p_stripe_price_id: priceId,
      p_credit_quantity: creditQuantity,
      p_stripe_event_id: event.id,
      p_raw_session: serializedSession,
    });

    await supabase
      .from("stripe_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);
  }

  return NextResponse.json({ received: true });
}
