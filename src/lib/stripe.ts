import Stripe from "stripe";
import { creditPriceMap, env } from "@/lib/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
});

export function getCreditsForPrice(priceId: string | null | undefined) {
  if (!priceId) return undefined;
  return creditPriceMap.get(priceId) ?? undefined;
}
