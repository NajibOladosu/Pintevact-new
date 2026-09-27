import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";

let stripe: Stripe | null = null;

function apiOverride(): Pick<Stripe.StripeConfig, "host" | "port" | "protocol"> {
  const base = env.stripeApiBase();
  if (!base) return {};
  const url = new URL(base);
  return { host: url.hostname, port: url.port || (url.protocol === "https:" ? 443 : 80), protocol: url.protocol.replace(":", "") as "http" | "https" };
}

export function getStripe() {
  if (!env.stripeSecretKey()) throw new Error("STRIPE_SECRET_KEY is not set");
  stripe ??= new Stripe(env.stripeSecretKey(), { appInfo: { name: "Pintevact" }, ...apiOverride() });
  return stripe;
}
