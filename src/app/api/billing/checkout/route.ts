import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { stripe, getCreditsForPrice } from "@/lib/stripe";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const priceId = body.priceId as string | undefined;

  if (!priceId) {
    return NextResponse.json({ message: "Price ID fehlt" }, { status: 400 });
  }

  const { supabase } = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Nicht angemeldet" }, { status: 401 });
  }

  const creditQuantity = getCreditsForPrice(priceId);
  if (!creditQuantity) {
    return NextResponse.json({ message: "Unbekannter Preis" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${env.APP_BASE_URL}/dashboard?checkout=success`,
    cancel_url: `${env.APP_BASE_URL}/dashboard?checkout=cancel`,
    metadata: {
      user_id: user.id,
      price_id: priceId,
      credit_quantity: String(creditQuantity),
    },
  });

  return NextResponse.json({ url: session.url });
}
