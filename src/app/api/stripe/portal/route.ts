import { NextResponse, type NextRequest } from "next/server";
import { getViewer } from "@/lib/data";
import { env, isStripeConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

/** Opens the Stripe customer portal (manage membership, invoices, payment methods). */
export async function POST(request: NextRequest) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.redirect(new URL("/login?next=/account/billing", request.url), { status: 303 });
  const customer = viewer.profile.stripeCustomerId;
  if (!isStripeConfigured() || !customer) {
    return NextResponse.redirect(new URL("/account/billing?portal=unavailable", request.url), { status: 303 });
  }
  const session = await getStripe().billingPortal.sessions.create({ customer, return_url: `${env.siteUrl()}/account/billing` });
  return NextResponse.redirect(session.url, { status: 303 });
}
