import type Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { handleStripeEvent } from "@/lib/billing/webhook";
import { createSupabaseCommerceRepo } from "@/lib/billing/supabase-repo";
import { notify } from "@/lib/notifications";

/** Stripe webhook endpoint. Configure in Stripe → Developers → Webhooks → {SITE_URL}/api/stripe/webhook */
export async function POST(request: Request) {
  const secret = env.stripeWebhookSecret();
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook not configured", { status: 400 });

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, signature, secret);
  } catch (err) {
    return new Response(`Invalid signature: ${(err as Error).message}`, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event, {
      repo: createSupabaseCommerceRepo(),
      notify,
      retrieveSubscription: (id) => getStripe().subscriptions.retrieve(id),
    });
    return Response.json({ received: true, result });
  } catch (err) {
    console.error("[stripe:webhook]", event.type, err);
    return new Response("Webhook handler failed", { status: 500 });
  }
}
