import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const signature = headers().get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Webhook nicht konfiguriert" }, { status: 400 });
  }

  const body = await request.text();

  let event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return NextResponse.json({ message: `Invalid signature: ${(error as Error).message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const credits = Number(session.metadata?.credits ?? 0);

    if (userId && credits > 0) {
      const supabase = createSupabaseAdminClient();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore typed admin client limitation for RPC helper
      await supabase.rpc("add_credits_to_user", {
        p_user: userId,
        p_amount: credits,
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Supabase admin client typing limitation
      await supabase.from("credit_transactions").insert({
        user_id: userId,
        amount: credits,
        type: "purchase",
        description: `Stripe Checkout (${credits} Credits)`,
      });
    }
  }

  return NextResponse.json({ received: true });
}
