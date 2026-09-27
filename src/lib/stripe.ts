import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!env.stripeSecretKey()) throw new Error("STRIPE_SECRET_KEY is not set");
  stripe ??= new Stripe(env.stripeSecretKey(), { appInfo: { name: "Pintevact" } });
  return stripe;
}
