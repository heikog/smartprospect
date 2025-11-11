import Stripe from "stripe";
import { creditPriceMap, env } from "@/lib/env.server";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
});

export function getCreditsForPrice(priceId: string | null | undefined) {
  if (!priceId) return undefined;
  return creditPriceMap.get(priceId) ?? undefined;
}
