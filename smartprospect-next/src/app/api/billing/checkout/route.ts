import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { getStripeClient } from "@/lib/stripe";

const CREDIT_PRICE_MAP: Record<number, string | undefined> = {
  50: process.env.STRIPE_PRICE_ID_CREDITS_50,
  100: process.env.STRIPE_PRICE_ID_CREDITS_100,
  200: process.env.STRIPE_PRICE_ID_CREDITS_200,
};

export async function POST(request: Request) {
  const supabase = createSupabaseRouteClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json();
  const credits = Number(body?.credits);
  const priceId = CREDIT_PRICE_MAP[credits];

  if (!priceId) {
    return NextResponse.json({ message: "Ungültiges Paket" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const stripe = getStripeClient();

  const sessionData = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/dashboard?checkout=cancel`,
    metadata: {
      user_id: session.user.id,
      credits: credits.toString(),
    },
  });

  return NextResponse.json({ url: sessionData.url });
}
